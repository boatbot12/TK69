from .models import AdminLog

def log_action(actor, action_type, target, details=None, ip_address=None):
    """
    Helper to create an AdminLog entry.
    """
    if not actor or not actor.is_authenticated:
        return

    target_model = target.__class__.__name__
    target_id = target.pk
    target_str = str(target)

    AdminLog.objects.create(
        actor=actor,
        action_type=action_type,
        target_model=target_model,
        target_id=target_id,
        target_str=target_str,
        details=details or {},
        ip_address=ip_address
    )
