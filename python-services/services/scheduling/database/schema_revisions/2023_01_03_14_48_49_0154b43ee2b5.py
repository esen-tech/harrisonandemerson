"""empty message

Revision ID: 0154b43ee2b5
Revises: 6dc2669de1e8
Create Date: 2023-01-03 14:48:49.030118

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0154b43ee2b5'
down_revision = '6dc2669de1e8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('appointment', sa.Column('principal_name', sa.String(length=128), nullable=True))
    op.add_column('appointment', sa.Column('principal_phone_number', sa.String(length=32), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('appointment', 'principal_phone_number')
    op.drop_column('appointment', 'principal_name')
    # ### end Alembic commands ###
