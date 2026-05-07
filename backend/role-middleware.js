const { APPROVAL_ROLES, PRODUCT_MANAGE_ROLES, TRANSACTION_ROLES } = require('./role-config');

const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.accountType || !allowedRoles.includes(req.accountType)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

const requireProductManager = requireRole(PRODUCT_MANAGE_ROLES);
const requireTransactionRole = requireRole(TRANSACTION_ROLES);
const requireApprovalRole = requireRole(APPROVAL_ROLES);

module.exports = {
  requireRole,
  requireProductManager,
  requireTransactionRole,
  requireApprovalRole,
};
