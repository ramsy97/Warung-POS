from sqlalchemy.orm import Session
from . import models

def create_audit_log(db: Session, user_id: int, action: str, module: str, details: str = None):
    """
    Creates an audit log entry.
    """
    log = models.AuditLog(
        user_id=user_id,
        action=action,
        module=module,
        details=details
    )
    db.add(log)
    db.commit()

def create_notification(db: Session, title: str, message: str, type: str = "Info"):
    """
    Creates a system notification.
    """
    notif = models.Notification(
        title=title,
        message=message,
        type=type
    )
    db.add(notif)
    db.commit()

def check_low_stock(db: Session, product: models.Product):
    """
    Checks if a product's stock is below its minimum stock setting,
    and creates a warning notification if it is.
    """
    if product.stock <= product.min_stock:
        # Avoid creating duplicate active notifications for the same product
        exists = db.query(models.Notification).filter(
            models.Notification.title == "Stok Hampir Habis",
            models.Notification.message.like(f"%{product.name}%"),
            models.Notification.is_read == False
        ).first()
        if not exists:
            create_notification(
                db,
                title="Stok Hampir Habis",
                message=f"Produk '{product.name}' ({product.sku}) mencapai batas stok minimum. Stok saat ini: {product.stock} {product.unit} (Batas: {product.min_stock})",
                type="Stock Warning"
            )
