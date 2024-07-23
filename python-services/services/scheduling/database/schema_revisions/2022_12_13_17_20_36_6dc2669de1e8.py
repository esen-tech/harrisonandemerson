"""empty message

Revision ID: 6dc2669de1e8
Revises: 8991e3649500
Create Date: 2022-12-13 17:20:36.360725

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "6dc2669de1e8"
down_revision = "8991e3649500"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "appointment", "coupon_code", new_column_name="cooperation_code_code"
    )


def downgrade():
    op.alter_column(
        "appointment", "cooperation_code_code", new_column_name="coupon_code"
    )
