"""empty message

Revision ID: 0fdd259e7dcc
Revises: b46af5226609
Create Date: 2022-10-17 15:53:53.795044

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0fdd259e7dcc"
down_revision = "b46af5226609"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("organization", "official_name", new_column_name="official_key")
    op.alter_column("organization", "display_name", new_column_name="display_key")
    op.alter_column("organization", "branch_name", new_column_name="branch_key")


def downgrade():
    op.alter_column("organization", "branch_key", new_column_name="branch_name")
    op.alter_column("organization", "display_key", new_column_name="display_name")
    op.alter_column("organization", "official_key", new_column_name="official_name")
