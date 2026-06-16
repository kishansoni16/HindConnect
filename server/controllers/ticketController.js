const { Ticket, Comment, Notification, ActivityLog, User } = require('../db');

// Calculate SLA deadline based on priority
const calculateSla = (priority) => {
  const now = new Date();
  switch (priority) {
    case 'Critical':
      return new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
    case 'High':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    case 'Medium':
      return new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
    case 'Low':
    default:
      return new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours
  }
};

const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority, department, attachments } = req.body;
    const employeeId = req.user.id;

    if (!title || !description || !category || !priority || !department) {
      return res.status(400).json({ message: 'All ticket fields are required' });
    }

    const userObj = await User.findById(employeeId);
    if (!userObj) {
      return res.status(404).json({ message: 'Employee user account not found' });
    }

    const slaDeadline = calculateSla(priority);

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      status: 'Open',
      department,
      employeeId,
      assignedTo: null,
      slaDeadline,
      attachments: attachments || [],
    });

    // Log Activity
    await ActivityLog.create({
      ticketId: ticket.id || ticket._id,
      action: 'Ticket Created',
      userId: employeeId,
      userName: userObj.name,
      details: `Ticket created by ${userObj.name} (${userObj.role}) with priority: ${priority}.`
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error creating ticket' });
  }
};

const getTickets = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { status, priority, category, search } = req.query;

    let query = {};

    // Role-based visibility
    if (role === 'Employee') {
      query.employeeId = userId;
    }

    // Filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    let tickets = await Ticket.find(query);

    // Manual search filtering (needed for both Mongo and JSONDB arrays)
    if (search) {
      const s = search.toLowerCase();
      tickets = tickets.filter(t => 
        t.title.toLowerCase().includes(s) || 
        t.description.toLowerCase().includes(s) ||
        (t.id && t.id.toLowerCase().includes(s)) ||
        (t._id && t._id.toString().toLowerCase().includes(s))
      );
    }

    // Sort by newest first
    tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error retrieving tickets' });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Access control
    if (role === 'Employee' && ticket.employeeId !== userId) {
      return res.status(403).json({ message: 'Access denied to this ticket' });
    }

    // Fetch comments
    let comments = await Comment.find({ ticketId: id });
    // Filter internal notes for employees
    if (role === 'Employee') {
      comments = comments.filter(c => !c.isInternal);
    }
    comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Fetch activities
    const activities = await ActivityLog.find({ ticketId: id });
    activities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Fetch employee details
    const employee = await User.findById(ticket.employeeId);
    
    // Fetch assigned support details
    let assignee = null;
    if (ticket.assignedTo) {
      assignee = await User.findById(ticket.assignedTo);
    }

    res.json({
      ticket,
      comments,
      activities,
      employee: employee ? { name: employee.name, email: employee.email, department: employee.department } : null,
      assignee: assignee ? { name: assignee.name, email: assignee.email } : null
    });
  } catch (error) {
    console.error('Get ticket detail error:', error);
    res.status(500).json({ message: 'Server error retrieving ticket detail' });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: updaterId } = req.user;
    const { status, priority, assignedTo } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Employees can only close their own ticket
    if (role === 'Employee') {
      if (ticket.employeeId !== updaterId) {
        return res.status(433).json({ message: 'Access denied' });
      }
      if (status !== 'Closed') {
        return res.status(400).json({ message: 'Employees can only set status to Closed' });
      }
    }

    const updater = await User.findById(updaterId);
    const updates = {};
    const logDetails = [];

    if (status && status !== ticket.status) {
      updates.status = status;
      logDetails.push(`status changed from '${ticket.status}' to '${status}'`);
      
      // Notify employee
      await Notification.create({
        userId: ticket.employeeId,
        message: `Your ticket "${ticket.title}" has been marked as ${status}.`
      });
    }

    if (priority && priority !== ticket.priority) {
      updates.priority = priority;
      updates.slaDeadline = calculateSla(priority);
      logDetails.push(`priority updated from '${ticket.priority}' to '${priority}' (SLA updated)`);
    }

    if (assignedTo !== undefined && assignedTo !== ticket.assignedTo) {
      updates.assignedTo = assignedTo;
      if (assignedTo) {
        const staff = await User.findById(assignedTo);
        const name = staff ? staff.name : 'Unknown';
        logDetails.push(`assigned to IT Staff: ${name}`);

        // Notify assigned staff
        await Notification.create({
          userId: assignedTo,
          message: `Ticket "${ticket.title}" has been assigned to you.`
        });
      } else {
        logDetails.push('ticket assignment cleared');
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.json(ticket);
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(id, updates);

    // Save Activity Log
    await ActivityLog.create({
      ticketId: id,
      action: 'Ticket Updated',
      userId: updaterId,
      userName: updater.name,
      details: `Ticket details updated: ${logDetails.join(', ')}.`
    });

    res.json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error updating ticket' });
  }
};

const addComment = async (req, res) => {
  try {
    const { id: ticketId } = req.params;
    const { message, isInternal } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!message) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const user = await User.findById(userId);

    // Employees cannot make internal notes
    const actualIsInternal = userRole === 'Employee' ? false : !!isInternal;

    const comment = await Comment.create({
      ticketId,
      userId,
      userName: user.name,
      userRole,
      message,
      isInternal: actualIsInternal
    });

    // Update ticket modified time
    await Ticket.findByIdAndUpdate(ticketId, { updatedAt: new Date().toISOString() });

    // Activity Log
    await ActivityLog.create({
      ticketId,
      action: actualIsInternal ? 'Internal Comment Added' : 'Comment Added',
      userId,
      userName: user.name,
      details: `${user.name} added a ${actualIsInternal ? 'private staff note' : 'public comment'}.`
    });

    // Notify employee if staff comments, notify staff if employee comments
    if (userRole !== 'Employee') {
      await Notification.create({
        userId: ticket.employeeId,
        message: `IT Staff member ${user.name} replied to your ticket "${ticket.title}".`
      });
    } else if (ticket.assignedTo) {
      await Notification.create({
        userId: ticket.assignedTo,
        message: `Employee ${user.name} commented on ticket "${ticket.title}".`
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error posting comment' });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment
};
