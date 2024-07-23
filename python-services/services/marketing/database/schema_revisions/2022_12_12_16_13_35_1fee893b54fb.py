"""empty message

Revision ID: 1fee893b54fb
Revises: f26c93542479
Create Date: 2022-12-12 16:13:35.078784

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1fee893b54fb'
down_revision = 'f26c93542479'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('end_user_care_product_referral_code',
    sa.Column('reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('data_alias', sa.String(length=256), nullable=True),
    sa.Column('create_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('end_user_reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('code', sa.String(length=32), nullable=False),
    sa.Column('referee_financial_order_discount_price_amount', sa.Numeric(), nullable=False),
    sa.PrimaryKeyConstraint('reference', name=op.f('pk_esen_marketing_end_user_care_product_referral_code'))
    )
    op.create_index(op.f('ix_esen_marketing_end_user_care_product_referral_code_create_time'), 'end_user_care_product_referral_code', ['create_time'], unique=False)
    op.create_index(op.f('ix_esen_marketing_end_user_care_product_referral_code_data_alias'), 'end_user_care_product_referral_code', ['data_alias'], unique=False)
    op.create_index(op.f('ix_esen_marketing_end_user_care_product_referral_code_reference'), 'end_user_care_product_referral_code', ['reference'], unique=False)
    op.create_index(op.f('ix_esen_marketing_end_user_care_product_referral_code_update_time'), 'end_user_care_product_referral_code', ['update_time'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_esen_marketing_end_user_care_product_referral_code_update_time'), table_name='end_user_care_product_referral_code')
    op.drop_index(op.f('ix_esen_marketing_end_user_care_product_referral_code_reference'), table_name='end_user_care_product_referral_code')
    op.drop_index(op.f('ix_esen_marketing_end_user_care_product_referral_code_data_alias'), table_name='end_user_care_product_referral_code')
    op.drop_index(op.f('ix_esen_marketing_end_user_care_product_referral_code_create_time'), table_name='end_user_care_product_referral_code')
    op.drop_table('end_user_care_product_referral_code')
    # ### end Alembic commands ###
