from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    expenses = relationship('Expense', back_populates='owner')

class Expense(Base):
    __tablename__ = 'expenses'
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String)
    category = Column(String, default="uncategorized")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'))
    owner = relationship('User', back_populates='expenses')

# Pydantic models for bank statement upload
class ParsedTransaction(BaseModel):
    date: str
    description: str
    amount: float
    category: str
    transaction_type: str  # 'income' or 'expense'
    balance: Optional[float] = None
    merchant_name: Optional[str] = None
    subcategory: Optional[str] = None
    payment_method: Optional[str] = None

class BankStatementUploadResponse(BaseModel):
    success: bool
    message: str
    transactions: List[ParsedTransaction]
    total_transactions: int
    bank_detected: Optional[str] = None
    file_format: str
    parsing_errors: List[str] = []

class TransactionImportRequest(BaseModel):
    transactions: List[Dict[str, Any]]
    user_id: str

class TransactionImportResponse(BaseModel):
    success: bool
    message: str
    imported_count: int
    failed_count: int
    errors: List[str] = []

class SupportedBankInfo(BaseModel):
    name: str
    code: str
    supported_formats: List[str]
    features: List[str]
