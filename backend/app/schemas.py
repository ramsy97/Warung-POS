from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Token and Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    full_name: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    full_name: str
    email: Optional[str] = None
    role: str  # super_admin, owner, kasir, staff_gudang
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Category ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Supplier ---
class SupplierBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    pic: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Customer ---
class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    total_transactions: float
    points: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Product ---
class ProductBase(BaseModel):
    sku: str
    barcode: Optional[str] = None
    name: str
    category_id: int
    cost_price: float
    sell_price: float
    min_stock: Optional[float] = 5.0
    unit: Optional[str] = "Pcs"
    supplier_id: Optional[int] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    stock: Optional[float] = 0.0

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    barcode: Optional[str] = None
    name: Optional[str] = None
    category_id: Optional[int] = None
    cost_price: Optional[float] = None
    sell_price: Optional[float] = None
    min_stock: Optional[float] = None
    unit: Optional[str] = None
    supplier_id: Optional[int] = None
    image_url: Optional[str] = None
    stock: Optional[float] = None

class ProductResponse(ProductBase):
    id: int
    stock: float
    created_at: datetime
    category: Optional[CategoryResponse] = None
    supplier: Optional[SupplierResponse] = None

    class Config:
        from_attributes = True

# --- Purchase Items & Purchases ---
class PurchaseItemCreate(BaseModel):
    product_id: int
    qty: float
    cost_price: float

class PurchaseItemResponse(BaseModel):
    id: int
    product_id: int
    qty: float
    cost_price: float
    subtotal: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class PurchaseCreate(BaseModel):
    supplier_id: int
    items: List[PurchaseItemCreate]
    payment_status: str = "Lunas"  # Lunas, Hutang
    due_date: Optional[datetime] = None

class PurchaseResponse(BaseModel):
    id: int
    supplier_id: int
    purchase_date: datetime
    total_amount: float
    payment_status: str
    due_date: Optional[datetime] = None
    created_by: int
    items: List[PurchaseItemResponse]
    supplier: Optional[SupplierResponse] = None

    class Config:
        from_attributes = True

# --- Sale Items & Sales (POS) ---
class SaleItemCreate(BaseModel):
    product_id: int
    qty: float
    sell_price: float

class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    qty: float
    sell_price: float
    subtotal: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    items: List[SaleItemCreate]
    discount: Optional[float] = 0.0
    payment_method: str  # Tunai, QRIS, Transfer, E-Wallet
    payment_status: str = "Lunas"  # Lunas, Piutang
    due_date: Optional[datetime] = None

class SaleResponse(BaseModel):
    id: int
    customer_id: Optional[int] = None
    sale_date: datetime
    total_amount: float
    discount: float
    final_amount: float
    payment_method: str
    payment_status: str
    due_date: Optional[datetime] = None
    points_earned: int
    created_by: int
    items: List[SaleItemResponse]
    customer: Optional[CustomerResponse] = None

    class Config:
        from_attributes = True

# --- Stock Movements ---
class StockMovementCreate(BaseModel):
    product_id: int
    type: str  # Masuk, Keluar, Penyesuaian, Rusak, Opname
    qty: float
    notes: Optional[str] = None

class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    type: str
    qty: float
    reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    created_by: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

# --- Cash Transactions ---
class CashTransactionCreate(BaseModel):
    type: str  # Masuk, Keluar
    amount: float
    category: str  # Penjualan, Pembelian, Operasional, Pelunasan Piutang, Pembayaran Hutang, DLL
    description: Optional[str] = None

class CashTransactionResponse(BaseModel):
    id: int
    type: str
    amount: float
    category: str
    description: Optional[str] = None
    reference: Optional[str] = None
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True

# --- Debt (Hutang) ---
class DebtResponse(BaseModel):
    id: int
    supplier_id: int
    purchase_id: int
    amount: float
    paid_amount: float
    status: str
    due_date: Optional[datetime] = None
    created_at: datetime
    supplier: Optional[SupplierResponse] = None

    class Config:
        from_attributes = True

class DebtPaymentRequest(BaseModel):
    payment_amount: float

# --- Receivable (Piutang) ---
class ReceivableResponse(BaseModel):
    id: int
    customer_id: int
    sale_id: int
    amount: float
    paid_amount: float
    status: str
    due_date: Optional[datetime] = None
    created_at: datetime
    customer: Optional[CustomerResponse] = None

    class Config:
        from_attributes = True

class ReceivablePaymentRequest(BaseModel):
    payment_amount: float

# --- Notification ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Audit Logs ---
class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    module: str
    details: Optional[str] = None
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
