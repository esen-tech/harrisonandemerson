"""empty message

Revision ID: 75de2ac73ab0
Revises: 
Create Date: 2022-10-17 14:41:29.314996

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '75de2ac73ab0'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('service_product',
    sa.Column('reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('data_alias', sa.String(length=256), nullable=True),
    sa.Column('create_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('organization_reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('display_sku_key', sa.String(length=128), nullable=False),
    sa.Column('display_description_key', sa.String(length=1024), nullable=True),
    sa.Column('non_covered_price_amount', sa.Numeric(), nullable=False),
    sa.Column('expire_time', sa.DateTime(), nullable=True),
    sa.Column('registration_fee_amount', sa.Numeric(), nullable=False),
    sa.Column('duration_in_time_slots', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('reference', name=op.f('pk_esen_product_service_product'))
    )
    op.create_index(op.f('ix_esen_product_service_product_create_time'), 'service_product', ['create_time'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_data_alias'), 'service_product', ['data_alias'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_organization_reference'), 'service_product', ['organization_reference'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_reference'), 'service_product', ['reference'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_update_time'), 'service_product', ['update_time'], unique=False)
    op.create_table('service_product_insurer',
    sa.Column('reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('data_alias', sa.String(length=256), nullable=True),
    sa.Column('create_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('service_product_reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('insurer_reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.ForeignKeyConstraint(['service_product_reference'], ['service_product.reference'], name=op.f('fk_esen_product_service_product_insurer_service_product_reference_service_product')),
    sa.PrimaryKeyConstraint('reference', name=op.f('pk_esen_product_service_product_insurer'))
    )
    op.create_index(op.f('ix_esen_product_service_product_insurer_create_time'), 'service_product_insurer', ['create_time'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_insurer_data_alias'), 'service_product_insurer', ['data_alias'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_insurer_reference'), 'service_product_insurer', ['reference'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_insurer_service_product_reference'), 'service_product_insurer', ['service_product_reference'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_insurer_update_time'), 'service_product_insurer', ['update_time'], unique=False)
    op.create_table('service_product_internal_user',
    sa.Column('reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('data_alias', sa.String(length=256), nullable=True),
    sa.Column('create_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('service_product_reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('internal_user_reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.ForeignKeyConstraint(['service_product_reference'], ['service_product.reference'], name=op.f('fk_esen_product_service_product_internal_user_service_product_reference_service_product')),
    sa.PrimaryKeyConstraint('reference', name=op.f('pk_esen_product_service_product_internal_user'))
    )
    op.create_index(op.f('ix_esen_product_service_product_internal_user_create_time'), 'service_product_internal_user', ['create_time'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_internal_user_data_alias'), 'service_product_internal_user', ['data_alias'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_internal_user_reference'), 'service_product_internal_user', ['reference'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_internal_user_service_product_reference'), 'service_product_internal_user', ['service_product_reference'], unique=False)
    op.create_index(op.f('ix_esen_product_service_product_internal_user_update_time'), 'service_product_internal_user', ['update_time'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_esen_product_service_product_internal_user_update_time'), table_name='service_product_internal_user')
    op.drop_index(op.f('ix_esen_product_service_product_internal_user_service_product_reference'), table_name='service_product_internal_user')
    op.drop_index(op.f('ix_esen_product_service_product_internal_user_reference'), table_name='service_product_internal_user')
    op.drop_index(op.f('ix_esen_product_service_product_internal_user_data_alias'), table_name='service_product_internal_user')
    op.drop_index(op.f('ix_esen_product_service_product_internal_user_create_time'), table_name='service_product_internal_user')
    op.drop_table('service_product_internal_user')
    op.drop_index(op.f('ix_esen_product_service_product_insurer_update_time'), table_name='service_product_insurer')
    op.drop_index(op.f('ix_esen_product_service_product_insurer_service_product_reference'), table_name='service_product_insurer')
    op.drop_index(op.f('ix_esen_product_service_product_insurer_reference'), table_name='service_product_insurer')
    op.drop_index(op.f('ix_esen_product_service_product_insurer_data_alias'), table_name='service_product_insurer')
    op.drop_index(op.f('ix_esen_product_service_product_insurer_create_time'), table_name='service_product_insurer')
    op.drop_table('service_product_insurer')
    op.drop_index(op.f('ix_esen_product_service_product_update_time'), table_name='service_product')
    op.drop_index(op.f('ix_esen_product_service_product_reference'), table_name='service_product')
    op.drop_index(op.f('ix_esen_product_service_product_organization_reference'), table_name='service_product')
    op.drop_index(op.f('ix_esen_product_service_product_data_alias'), table_name='service_product')
    op.drop_index(op.f('ix_esen_product_service_product_create_time'), table_name='service_product')
    op.drop_table('service_product')
    # ### end Alembic commands ###
