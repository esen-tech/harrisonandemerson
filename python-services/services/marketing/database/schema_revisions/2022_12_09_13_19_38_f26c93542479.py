"""empty message

Revision ID: f26c93542479
Revises: 
Create Date: 2022-12-09 13:19:38.500046

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f26c93542479'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('coupon',
    sa.Column('reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('data_alias', sa.String(length=256), nullable=True),
    sa.Column('create_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('coupon_code', sa.String(length=32), nullable=False),
    sa.Column('expiration_time', sa.DateTime(), nullable=False),
    sa.Column('entity_name', sa.String(length=128), nullable=True),
    sa.Column('operation_remark', sa.String(length=1024), nullable=True),
    sa.PrimaryKeyConstraint('reference', name=op.f('pk_esen_marketing_coupon'))
    )
    op.create_index(op.f('ix_esen_marketing_coupon_create_time'), 'coupon', ['create_time'], unique=False)
    op.create_index(op.f('ix_esen_marketing_coupon_data_alias'), 'coupon', ['data_alias'], unique=False)
    op.create_index(op.f('ix_esen_marketing_coupon_reference'), 'coupon', ['reference'], unique=False)
    op.create_index(op.f('ix_esen_marketing_coupon_update_time'), 'coupon', ['update_time'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_esen_marketing_coupon_update_time'), table_name='coupon')
    op.drop_index(op.f('ix_esen_marketing_coupon_reference'), table_name='coupon')
    op.drop_index(op.f('ix_esen_marketing_coupon_data_alias'), table_name='coupon')
    op.drop_index(op.f('ix_esen_marketing_coupon_create_time'), table_name='coupon')
    op.drop_table('coupon')
    # ### end Alembic commands ###