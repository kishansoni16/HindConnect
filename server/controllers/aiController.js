const { Ticket } = require('../db');

// Pattern databases for matching
const KB_HELP_RULES = [
  {
    keywords: ['vpn', 'wifi', 'internet', 'network', 'connect', 'ping', 'offline'],
    category: 'Network',
    priority: 'High',
    team: 'IT Infrastructure',
    steps: [
      'Verify you are connected to a working Internet connection (outside corporate intranet first).',
      'Ensure GlobalProtect VPN client is updated to the latest corporate build (v5.6).',
      'Try flushing your system DNS cache (run cmd as admin: "ipconfig /flushdns").',
      'Check if your active session is blocked by regional IP policies.'
    ]
  },
  {
    keywords: ['password', 'login', 'reset', 'lock', 'account', 'access', 'active directory', 'permission', 'outlook credentials'],
    category: 'Access & Security',
    priority: 'Medium',
    team: 'System Administration',
    steps: [
      'Navigate to the self-service Hindalco Active Directory portal (identity.hindalco.com).',
      'Verify if your active password has expired (passwords expire every 90 days per policy).',
      'If your account is locked, wait 15 minutes for security auto-unlock before attempting again.',
      'Check if multi-factor authentication (MFA) is pending approval on your registered authenticator app.'
    ]
  },
  {
    keywords: ['laptop', 'monitor', 'keyboard', 'printer', 'mouse', 'docking', 'hardware', 'screen', 'audio', 'mic'],
    category: 'Hardware',
    priority: 'Low',
    team: 'IT Infrastructure',
    steps: [
      'Unplug and reconnect the device power/data cables (USB, HDMI, power brick).',
      'For monitor issue: press Win + Ctrl + Shift + B to reload your graphics card drivers.',
      'For printers: Ensure you are connected to the printer subnet and have corporate badge mapping configured.',
      'Schedule a hardware assessment with the regional desktop support engineer if physical damage is suspected.'
    ]
  },
  {
    keywords: ['outlook', 'teams', 'office', 'excel', 'word', 'software', 'install', 'license', 'activation', 'crash'],
    category: 'Software',
    priority: 'Medium',
    team: 'Software Support',
    steps: [
      'Restart the affected application and run in Safe Mode (e.g. hold Ctrl while launching Outlook).',
      'Perform a repair of Microsoft 365 apps via Control Panel -> Programs & Features -> Change -> Quick Repair.',
      'Confirm you are logged into Office using your official @hindconnect.com or @hindalco.adgp.com alias.',
      'Delete local Teams cache directory located in %appdata%/Microsoft/Teams if Teams fails to start.'
    ]
  },
  {
    keywords: ['sap', 'erp', 'hana', 'invoice', 'purchase order', 'po', 'grn'],
    category: 'Software',
    priority: 'High',
    team: 'SAP ERP Operations Group',
    steps: [
      'Check if SAP GUI patch level is upgraded to v7.70 or later.',
      'Verify if the target transaction code (T-code) is active on the server.',
      'Confirm that your profile has been granted the corresponding roles in SAP GRC.',
      'Clear local SAP cache files and log in again.'
    ]
  }
];

const analyzeTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.json({
        predictedCategory: 'Software',
        priority: 'Medium',
        suggestedTeam: 'Software Support',
        similarTickets: [],
        troubleshootingSteps: ['Start typing an issue title to receive AI recommendations.']
      });
    }

    const text = `${title} ${description || ''}`.toLowerCase();

    // Determine category and suggestions based on keywords
    let match = null;
    let maxMatches = 0;

    for (let rule of KB_HELP_RULES) {
      let score = 0;
      for (let keyword of rule.keywords) {
        if (text.includes(keyword)) {
          score++;
        }
      }
      if (score > maxMatches) {
        maxMatches = score;
        match = rule;
      }
    }

    // Default values if no rule matches
    const predictedCategory = match ? match.category : 'Software';
    const suggestedTeam = match ? match.team : 'Software Support';
    const priority = match ? match.priority : 'Medium';
    const troubleshootingSteps = match ? match.steps : [
      'Please detail your issue to receive tailored steps.',
      'Ensure all open work is saved before IT staff starts troubleshooting.',
      'Make sure to mention your workstation asset ID and IP address.'
    ];

    // Priority modifier for urgent keywords
    let finalPriority = priority;
    if (text.includes('urgent') || text.includes('critical') || text.includes('blocker') || text.includes('production down') || text.includes('factory stop')) {
      finalPriority = 'Critical';
    } else if (text.includes('broken') || text.includes('unable to work') || text.includes('major')) {
      finalPriority = 'High';
    }

    // Duplicate ticket detection
    const allTickets = await Ticket.find({});
    const similarTickets = allTickets.filter(ticket => {
      const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const ticketTitle = ticket.title.toLowerCase();
      let matchCount = 0;

      for (let word of titleWords) {
        if (ticketTitle.includes(word)) {
          matchCount++;
        }
      }

      // If at least 2 words match or titles are very similar
      return matchCount >= 2 && ticket.status !== 'Closed';
    }).map(ticket => ({
      id: ticket.id || ticket._id,
      title: ticket.title,
      status: ticket.status,
      createdAt: ticket.createdAt
    })).slice(0, 3); // return top 3 similar active tickets

    res.json({
      predictedCategory,
      priority: finalPriority,
      suggestedTeam,
      similarTickets,
      troubleshootingSteps
    });
  } catch (error) {
    console.error('AI Analyze Error:', error);
    res.status(500).json({ message: 'Server error during AI analysis' });
  }
};

module.exports = {
  analyzeTicket
};
