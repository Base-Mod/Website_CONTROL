"""Initial database setup

Revision ID: 001
Revises: 
Create Date: 2025-12-15

"""
from alembic import op
import sqlalchemy as sa
from passlib.context import CryptContext


# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(50), nullable=False),
        sa.Column('password', sa.String(255), nullable=False),
        sa.Column('email', sa.String(100)),
        sa.Column('full_name', sa.String(100)),
        sa.Column('role', sa.Enum('admin', 'user', name='userrole'), server_default='user'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username')
    )
    
    # Insert default users
    op.execute(f"""
        INSERT INTO users (username, password, email, full_name, role)
        VALUES 
        ('admin', '{pwd_context.hash("password")}', 'admin@example.com', 'Administrator', 'admin'),
        ('user1', '{pwd_context.hash("password")}', 'user1@example.com', 'User One', 'user')
    """)
    
    # Create devices table
    op.create_table(
        'devices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('device_name', sa.String(100), nullable=False),
        sa.Column('device_type', sa.Enum('light', 'ac', 'fan', 'heater', 'socket', 'other', name='devicetype'), server_default='other'),
        sa.Column('location', sa.String(100)),
        sa.Column('status', sa.Enum('on', 'off', name='devicestatus'), server_default='off'),
        sa.Column('power_rating', sa.Float(), server_default='0.0'),
        sa.Column('is_active', sa.Boolean(), server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Insert sample devices
    op.execute("""
        INSERT INTO devices (device_name, device_type, location, status, power_rating)
        VALUES 
        ('Đèn phòng khách', 'light', 'Phòng khách', 'off', 60.0),
        ('Điều hòa phòng ngủ', 'ac', 'Phòng ngủ', 'off', 1500.0),
        ('Quạt trần', 'fan', 'Phòng ăn', 'off', 75.0),
        ('Máy nước nóng', 'heater', 'Nhà tắm', 'off', 2500.0),
        ('Ổ cắm đa năng 1', 'socket', 'Văn phòng', 'on', 250.0),
        ('Đèn sân vườn', 'light', 'Sân vườn', 'off', 100.0)
    """)


def downgrade():
    op.drop_table('devices')
    op.drop_table('users')
