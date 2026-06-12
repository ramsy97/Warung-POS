from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from . import models, auth
import datetime

def seed_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if users already exist
        if db.query(models.User).first():
            print("Database already seeded.")
            return

        print("Seeding database...")
        
        # 1. Create Users
        users = [
            models.User(
                username="admin",
                hashed_password=auth.get_password_hash("admin123"),
                full_name="Super Admin Warung",
                email="admin@warungpos.com",
                role="super_admin"
            ),
            models.User(
                username="owner",
                hashed_password=auth.get_password_hash("owner123"),
                full_name="Pak Budi (Owner)",
                email="owner@warungpos.com",
                role="owner"
            ),
            models.User(
                username="kasir",
                hashed_password=auth.get_password_hash("kasir123"),
                full_name="Siti (Kasir)",
                email="siti@warungpos.com",
                role="kasir"
            ),
            models.User(
                username="gudang",
                hashed_password=auth.get_password_hash("gudang123"),
                full_name="Agus (Staff Gudang)",
                email="agus@warungpos.com",
                role="staff_gudang"
            )
        ]
        db.add_all(users)
        db.commit()

        # Get admin user ID for referencing
        admin_id = db.query(models.User).filter(models.User.username == "admin").first().id

        # 2. Create Categories
        categories = [
            models.Category(name="Makanan", description="Makanan ringan dan makanan instan"),
            models.Category(name="Minuman", description="Minuman botol, kaleng, dan kemasan"),
            models.Category(name="Sembako", description="Sembilan bahan pokok kebutuhan dapur"),
            models.Category(name="Kebutuhan Rumah Tangga", description="Sabun, pasta gigi, shampoo, dll"),
            models.Category(name="Rokok & Korek", description="Aneka rokok dan pemantik")
        ]
        db.add_all(categories)
        db.commit()

        cat_makanan = db.query(models.Category).filter(models.Category.name == "Makanan").first().id
        cat_minuman = db.query(models.Category).filter(models.Category.name == "Minuman").first().id
        cat_sembako = db.query(models.Category).filter(models.Category.name == "Sembako").first().id
        cat_rt = db.query(models.Category).filter(models.Category.name == "Kebutuhan Rumah Tangga").first().id

        # 3. Create Suppliers
        suppliers = [
            models.Supplier(name="PT Indofood Sukses Makmur", phone="021-5551234", email="sales@indofood.com", address="Sudirman Plaza, Jakarta", pic="Budi Santoso"),
            models.Supplier(name="PT Unilever Indonesia", phone="021-5555678", email="contact@unilever.com", address="BSD City, Tangerang", pic="Dewi Lestari"),
            models.Supplier(name="Grosir Sembako Jaya", phone="0812-3456-7890", email="jaya@sembako.com", address="Pasar Induk Kramat Jati, Jakarta", pic="Haji Anwar")
        ]
        db.add_all(suppliers)
        db.commit()

        sup_indofood = db.query(models.Supplier).filter(models.Supplier.name == "PT Indofood Sukses Makmur").first().id
        sup_unilever = db.query(models.Supplier).filter(models.Supplier.name == "PT Unilever Indonesia").first().id
        sup_sembako = db.query(models.Supplier).filter(models.Supplier.name == "Grosir Sembako Jaya").first().id

        # 4. Create Customers
        customers = [
            models.Customer(name="Pelanggan Umum", phone="000", email=None, address="Alamat Umum", total_transactions=0.0, points=0),
            models.Customer(name="Ibu Ratna", phone="0813-1111-2222", email="ratna@gmail.com", address="Jl. Melati No. 5", total_transactions=250000.0, points=50),
            models.Customer(name="Pak Hendra", phone="0813-3333-4444", email="hendra@gmail.com", address="Jl. Mawar No. 12", total_transactions=150000.0, points=30)
        ]
        db.add_all(customers)
        db.commit()

        # 5. Create Products
        products = [
            models.Product(sku="PRD001", barcode="8998866200225", name="Indomie Goreng", category_id=cat_makanan, cost_price=2800.0, sell_price=3500.0, stock=120.0, min_stock=20.0, unit="Pcs", supplier_id=sup_indofood),
            models.Product(sku="PRD002", barcode="8998866200232", name="Indomie Ayam Bawang", category_id=cat_makanan, cost_price=2700.0, sell_price=3300.0, stock=80.0, min_stock=20.0, unit="Pcs", supplier_id=sup_indofood),
            models.Product(sku="PRD003", barcode="8992689001124", name="Pocari Sweat 500ml", category_id=cat_minuman, cost_price=6200.0, sell_price=7500.0, stock=50.0, min_stock=10.0, unit="Botol", supplier_id=sup_indofood),
            models.Product(sku="PRD004", barcode="8992761001004", name="Teh Pucuk Harum 350ml", category_id=cat_minuman, cost_price=3000.0, sell_price=4000.0, stock=15.0, min_stock=15.0, unit="Botol", supplier_id=sup_indofood),  # will trigger low stock
            models.Product(sku="PRD005", barcode="8999999002255", name="Beras Pandan Wangi 5kg", category_id=cat_sembako, cost_price=65000.0, sell_price=78000.0, stock=30.0, min_stock=5.0, unit="Karung", supplier_id=sup_sembako),
            models.Product(sku="PRD006", barcode="8999999002262", name="Minyak Goreng Filma 2L", category_id=cat_sembako, cost_price=32000.0, sell_price=38000.0, stock=3.0, min_stock=10.0, unit="Pouch", supplier_id=sup_sembako),  # low stock warning
            models.Product(sku="PRD007", barcode="8992695110025", name="Lifebuoy Sabun Mandi Red", category_id=cat_rt, cost_price=3500.0, sell_price=4500.0, stock=40.0, min_stock=10.0, unit="Pcs", supplier_id=sup_unilever),
            models.Product(sku="PRD008", barcode="8992695110032", name="Pepsodent 190g", category_id=cat_rt, cost_price=10500.0, sell_price=13000.0, stock=25.0, min_stock=5.0, unit="Pcs", supplier_id=sup_unilever)
        ]
        db.add_all(products)
        db.commit()

        # Add initial stock movements for auditing
        db_products = db.query(models.Product).all()
        for p in db_products:
            movement = models.StockMovement(
                product_id=p.id,
                type="Masuk",
                qty=p.stock,
                reference="Seed Data",
                notes="Saldo Awal Stok",
                created_by=admin_id
            )
            db.add(movement)
            # Create low stock warning notifications if applicable
            if p.stock <= p.min_stock:
                notif = models.Notification(
                    title="Stok Hampir Habis",
                    message=f"Produk '{p.name}' ({p.sku}) mencapai batas stok minimum. Stok saat ini: {p.stock} {p.unit} (Batas: {p.min_stock})",
                    type="Stock Warning"
                )
                db.add(notif)
        
        # Add initial cash transaction
        cash_in = models.CashTransaction(
            type="Masuk",
            amount=5000000.0,  # 5 Million initial capital
            category="Operasional",
            description="Modal Awal Kas Warung",
            reference="Initial",
            created_by=admin_id
        )
        db.add(cash_in)

        # Audit logs for seeding
        audit_log = models.AuditLog(
            user_id=admin_id,
            action="Seed Database",
            module="System",
            details="Database initialized with categories, products, suppliers, customers, and standard accounts."
        )
        db.add(audit_log)

        db.commit()
        print("Database successfully seeded.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
