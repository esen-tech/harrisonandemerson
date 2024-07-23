"""empty message

Revision ID: b1245aff4430
Revises: 218a8e9e8d46
Create Date: 2022-12-13 17:22:35.290957

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "b1245aff4430"
down_revision = "218a8e9e8d46"
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table("coupon", "cooperation_code")
    op.alter_column("cooperation_code", "coupon_code", new_column_name="code")


def downgrade():
    op.alter_column("cooperation_code", "code", new_column_name="coupon_code")
    op.rename_table("cooperation_code", "coupon")
