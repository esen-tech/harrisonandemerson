"""empty message

Revision ID: db5edff64cdf
Revises: 12ba2fb8d1ea
Create Date: 2022-12-12 16:52:35.041610

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'db5edff64cdf'
down_revision = '12ba2fb8d1ea'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('care_product', sa.Column('display_note', sa.String(length=1024), nullable=True))
    op.add_column('financial_order', sa.Column('raw_discount_code', sa.String(length=32), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('financial_order', 'raw_discount_code')
    op.drop_column('care_product', 'display_note')
    # ### end Alembic commands ###