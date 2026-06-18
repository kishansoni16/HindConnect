const dotenv = require('dotenv');
dotenv.config();

const bcrypt = require('bcryptjs');
const { connectDB, User, Ticket, Comment, KnowledgeBase, Notification, ActivityLog } = require('./db');

const seed = async () => {
  console.log('Starting database seeding...');
  await connectDB();

  // 1. Clear database
  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Ticket.deleteMany({});
  await Comment.deleteMany({});
  await KnowledgeBase.deleteMany({});
  await Notification.deleteMany({});
  await ActivityLog.deleteMany({});

  // 2. Hash default passwords
  console.log('Creating user accounts...');
  const salt = await bcrypt.genSalt(10);
  const employeePwd = await bcrypt.hash('password123', salt);
  const staffPwd = await bcrypt.hash('password123', salt);
  const adminPwd = await bcrypt.hash('password123', salt);

  // 3. Create Users
  const usersToCreate = [
    {
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@hindconnect.com',
      password: employeePwd,
      role: 'Employee',
      department: 'Refinery',
      isApproved: true
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@hindconnect.com',
      password: employeePwd,
      role: 'Employee',
      department: 'Smelter',
      isApproved: true
    },
    {
      name: 'Anil Mehta',
      email: 'anil.mehta@hindconnect.com',
      password: employeePwd,
      role: 'Employee',
      department: 'Logistics',
      isApproved: true
    },
    {
      name: 'Suresh Kumar',
      email: 'suresh.kumar@hindconnect.com',
      password: employeePwd,
      role: 'Employee',
      department: 'Finance',
      isApproved: true
    },
    {
      name: 'Amit Verma',
      email: 'amit.verma@hindconnect.com',
      password: staffPwd,
      role: 'IT Staff',
      department: 'IT',
      isApproved: true
    },
    {
      name: 'Sunita Rao',
      email: 'sunita.rao@hindconnect.com',
      password: staffPwd,
      role: 'IT Staff',
      department: 'IT',
      isApproved: true
    },
    {
      name: 'John Doe',
      email: 'john.doe@hindconnect.com',
      password: staffPwd,
      role: 'IT Staff',
      department: 'IT',
      isApproved: true
    },
    {
      name: 'Vikram Aditya',
      email: 'vikram.aditya@hindconnect.com',
      password: adminPwd,
      role: 'Admin',
      department: 'IT',
      isApproved: true
    }
  ];

  const createdUsers = [];
  for (let u of usersToCreate) {
    const userObj = await User.create(u);
    createdUsers.push(userObj);
  }

  const findUserByEmail = (email) => {
    return createdUsers.find(u => u.email === email);
  };

  const rajesh = findUserByEmail('rajesh.sharma@hindconnect.com');
  const priya = findUserByEmail('priya.patel@hindconnect.com');
  const anil = findUserByEmail('anil.mehta@hindconnect.com');
  const suresh = findUserByEmail('suresh.kumar@hindconnect.com');

  const amit = findUserByEmail('amit.verma@hindconnect.com');
  const sunita = findUserByEmail('sunita.rao@hindconnect.com');
  const john = findUserByEmail('john.doe@hindconnect.com');

  const vikram = findUserByEmail('vikram.aditya@hindconnect.com');

  console.log(`Successfully created ${createdUsers.length} user accounts.`);

  // 4. Create Knowledge Base articles
  console.log('Seeding Knowledge Base articles...');
  const kbArticles = [
    {
      title: 'How to connect to HindConnect Corporate VPN using GlobalProtect client',
      category: 'Network',
      content: `### HindConnect GlobalProtect VPN Configuration Guide

This article provides step-by-step instructions on connecting to the corporate intranet from remote locations or home office.

#### Prerequisites
1. You must have an active HindConnect Active Directory (AD) login.
2. A corporate-issued laptop with **Palo Alto GlobalProtect** client preloaded.
3. Multi-Factor Authentication (MFA) enabled on your corporate mobile device.

#### Connection Steps
1. Open the **GlobalProtect** application from the Windows taskbar icon.
2. In the Portal Address text box, enter: \`vpn.hindalco.com\`.
3. Click **Connect**.
4. A browser tab will open demanding authorization. Input your corporate email (\`username@hindconnect.com\`) and password.
5. Approve the login notification sent to your MFA mobile application.
6. The client will initialize, verify machine compliance (anti-virus status, patches), and connect.

#### Troubleshooting
* **Error: Portal Unreachable**: Verify your local home WiFi connection is active.
* **Error: Account Locked**: Follow self-service password reset guide or contact IT support at Ext 4400.`,
      views: 142,
      helpfulVotes: 98
    },
    {
      title: 'Self-service active directory password reset instructions',
      category: 'Access & Security',
      content: `### Active Directory (AD) Self-Service Password Reset (SSPR)

HindConnect accounts expire automatically every 90 days. If you forget your password or it gets locked, use this guide to restore access.

#### Requirements
* You must have previously configured security questions or verified a secondary mobile number on the identity portal.

#### Standard Reset Protocol
1. On your personal mobile or another workstation, navigate to: **https://identity.hindalco.com**.
2. Click on the **Reset Forgotten Password** link.
3. Enter your corporate email (\`user@hindconnect.com\`) and complete the anti-spam verification.
4. Choose your verification factor:
   * **SMS Verification**: Send a security code to your registered mobile.
   * **Security Questions**: Answer the 3 pre-configured security questions.
5. Input the verification code and set a new password.

#### Corporate Password Policy
* Must be at least **12 characters** long.
* Must include uppercase letters, numbers, and at least one special symbol (e.g. \`#, @, !, $\`).
* Cannot reuse any of your last 5 passwords.`,
      views: 245,
      helpfulVotes: 184
    },
    {
      title: 'Troubleshooting office network printers and card mappings',
      category: 'Hardware',
      content: `### Corporate Multi-Function Printer (MFP) Setup and Card Mapping

This document details how to map your corporate badge to the office network printers (HP / Ricoh stations).

#### Step 1: Mapping Badge (First Time User)
1. Go to any regional printer terminal and swipe your corporate physical badge.
2. The card scanner will beep and prompt "Card Unknown. Associate badge with account?".
3. Tap **Yes** and enter your Active Directory AD login credentials on the touch screen.
4. Tap **Confirm**. Your badge is now mapped to your print queue.

#### Step 2: Printing from Windows Workstation
1. Open the document and print using printer name: \`\\\\prnt-srv-corp\\HindPrint-Secure\`.
2. Walk to any printer station in the corporate building and tap your badge on the reader.
3. Select **Release Documents** and select the documents you want to print.
4. Tap **Print**.

#### Troubleshooting printer offline:
* Ensure printer power cable is snug.
* Confirm your laptop is connected to corporate LAN or Secure WiFi (not Guest Wifi).`,
      views: 78,
      helpfulVotes: 42
    },
    {
      title: 'Repairing Outlook cache and mailbox sync errors',
      category: 'Software',
      content: `### Resolving Microsoft Outlook Syncing and Mailbox Issues

If you are experiencing delayed emails, search indexing failures, or connection drops in Outlook, follow these steps.

#### Step 1: Force Folder Synchronization
1. Go to the **Send / Receive** tab at the top of Outlook.
2. Click on **Update Folder**.
3. Observe the bottom status bar to see if it shows "Connected" and "All folders are up to date".

#### Step 2: Rebuilding the Offline Outlook Data File (.OST)
1. Close Microsoft Outlook.
2. Press **Win + R** to open the Run command.
3. Type \`control\` and hit Enter to launch Control Panel.
4. Click on **Mail (Microsoft Outlook)**.
5. In the window, click **Data Files**.
6. Select your corporate email account and click **Open File Location**.
7. Delete or rename the \`.ost\` file (e.g., rename to \`.ost.old\`).
8. Start Outlook. It will automatically download your emails from the exchange server and rebuild the file.`,
      views: 189,
      helpfulVotes: 120
    },
    {
      title: 'Requesting access permissions for ERP SAP S/4HANA',
      category: 'Access & Security',
      content: `### SAP S/4HANA ERP Access Provisioning Guide

Follow this guide to request transactional codes (T-codes) and system roles inside the corporate SAP environment.

#### Approval Workflow
1. Request submitted by Employee.
2. Automated review against Segregation of Duties (SoD) policies.
3. Line Manager Approval.
4. Functional Area Owner Approval.
5. GRC Security group provisioning.

#### Request Steps
1. Open the internal intranet page and click on **SAP GRC Portal** (\`https://grc.hindalco.com\`).
2. Log in using your AD credentials.
3. Click on **Access Request**.
4. Select the target SAP environment (e.g., \`SAP Production ERP (P44)\`).
5. Search for the roles or Transaction Codes you require (e.g., \`ME21N\` for Purchase Orders, \`FB01\` for Accounting documents).
6. Fill in the justification explaining why these permissions are necessary for your role.
7. Click **Submit** to trigger the approval hierarchy.`,
      views: 95,
      helpfulVotes: 61
    }
  ];

  for (let art of kbArticles) {
    await KnowledgeBase.create(art);
  }
  console.log('Seeded Knowledge Base successfully.');

  // 5. Create Tickets
  console.log('Seeding support tickets...');
  const ticketsToCreate = [
    {
      title: 'GlobalProtect VPN fails on home WiFi',
      description: 'Since yesterday evening, my GlobalProtect VPN client hangs on "Connecting" and then reports portal unreachable. I can access Google and normal sites, but cannot log into corporate tools.',
      category: 'Network',
      priority: 'High',
      status: 'Open',
      department: 'Refinery',
      employeeId: rajesh.id || rajesh._id,
      assignedTo: amit.id || amit._id,
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
    {
      title: 'Outlook password prompt loop on boot',
      description: 'Outlook repeatedly prompts for my AD credentials every 10 seconds. Even after checking "Remember credentials" and typing the password correctly, the window pops back up. Unable to access mail.',
      category: 'Access & Security',
      priority: 'Medium',
      status: 'Pending',
      department: 'Smelter',
      employeeId: priya.id || priya._id,
      assignedTo: sunita.id || sunita._id,
      slaDeadline: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    },
    {
      title: 'Office printer in Smelter control room offline',
      description: 'The HP LaserJet printer is showing a hardware offline warning on my laptop print manager. Re-plugged USB and network cable, but status does not change. Need to print the shift reports.',
      category: 'Hardware',
      priority: 'High',
      status: 'Open',
      department: 'Smelter',
      employeeId: priya.id || priya._id,
      assignedTo: null,
      slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
    {
      title: 'SAP transaction code ME21N authentication failure',
      description: 'Getting authorization error "You are not authorized to use transaction code ME21N" when generating purchase orders. This is required for refinery supply shipments.',
      category: 'Access & Security',
      priority: 'Critical',
      status: 'Open',
      department: 'Refinery',
      employeeId: rajesh.id || rajesh._id,
      assignedTo: null,
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    },
    {
      title: 'Laptop screen flickering and hardware check failure',
      description: 'Dell workstation screen flashes green horizontal lines. Running BIOS diagnostics showed warning code 2000-0142 indicating memory/motherboard issues. Urgently need repair.',
      category: 'Hardware',
      priority: 'Critical',
      status: 'Resolved',
      department: 'Logistics',
      employeeId: anil.id || anil._id,
      assignedTo: john.id || john._id,
      slaDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // SLA deadline passed
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
      updatedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(), // resolved in 8 hours (within 4h critical SLA? No, missed by 4h, represents an SLA violation resolved)
    },
    {
      title: 'New MS Teams client upgrade request',
      description: 'Requesting permission to install the new corporate Teams layout with screen sharing optimization. Currently my app installer reports administrator blocking.',
      category: 'Software',
      priority: 'Low',
      status: 'Closed',
      department: 'Finance',
      employeeId: suresh.id || suresh._id,
      assignedTo: amit.id || amit._id,
      slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Closed 3 days ago
    }
  ];

  const createdTickets = [];
  for (let t of ticketsToCreate) {
    const tObj = await Ticket.create(t);
    createdTickets.push(tObj);
  }
  console.log(`Seeded ${createdTickets.length} support tickets.`);

  // 6. Seed Comments & Activity Logs for tickets
  console.log('Adding comments and activity logs...');
  
  // For ticket 0: GlobalProtect
  const t0 = createdTickets[0];
  await Comment.create({
    ticketId: t0.id || t0._id,
    userId: amit.id || amit._id,
    userName: amit.name,
    userRole: amit.role,
    message: 'Rajesh, could you verify if you can reach the intranet landing page at intranet.hindconnect.com? If yes, it is a policy mapping issue, not VPN routing.',
    isInternal: false,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  });

  await Comment.create({
    ticketId: t0.id || t0._id,
    userId: amit.id || amit._id,
    userName: amit.name,
    userRole: amit.role,
    message: 'Internal note: Re-indexing routing rules on ASA firewall might resolve the client gateway timeout. Need to cross-check security group policies.',
    isInternal: true,
    createdAt: new Date(Date.now() - 9.5 * 60 * 60 * 1000).toISOString()
  });

  await ActivityLog.create({
    ticketId: t0.id || t0._id,
    action: 'Ticket Created',
    userId: rajesh.id || rajesh._id,
    userName: rajesh.name,
    details: 'Ticket opened for VPN Connectivity issues.',
    createdAt: t0.createdAt
  });

  await ActivityLog.create({
    ticketId: t0.id || t0._id,
    action: 'Assignee Updated',
    userId: vikram.id || vikram._id,
    userName: vikram.name,
    details: `Ticket assigned to ${amit.name} for technical review.`,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
  });

  // For ticket 1: Outlook credential loop
  const t1 = createdTickets[1];
  await Comment.create({
    ticketId: t1.id || t1._id,
    userId: sunita.id || sunita._id,
    userName: sunita.name,
    userRole: sunita.role,
    message: 'Hi Priya, please delete your credentials in Credential Manager. Search for "Credential Manager" in Windows search, look for Outlook/Office web credentials, delete them, and reboot.',
    isInternal: false,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  });

  await ActivityLog.create({
    ticketId: t1.id || t1._id,
    action: 'Ticket Created',
    userId: priya.id || priya._id,
    userName: priya.name,
    details: 'Ticket opened for Access/Credentials loop.',
    createdAt: t1.createdAt
  });

  // Notifications
  await Notification.create({
    userId: rajesh.id || rajesh._id,
    message: `Your ticket "GlobalProtect VPN fails on home WiFi" has been assigned to ${amit.name}.`,
    isRead: false,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
  });

  await Notification.create({
    userId: amit.id || amit._id,
    message: `Ticket "GlobalProtect VPN fails on home WiFi" has been assigned to you.`,
    isRead: false,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
  });

  await Notification.create({
    userId: priya.id || priya._id,
    message: `IT Staff Sunita Rao commented on your ticket: "Hi Priya, please delete your credentials..."`,
    isRead: false,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  });

  console.log('Seeding activity logs and comments successfully completed.');
  console.log('Database seeding operation fully completed!');
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding process failed:', err);
      process.exit(1);
    });
}

module.exports = seed;
