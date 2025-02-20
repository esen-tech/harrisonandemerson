"""empty message

Revision ID: 3b24f5cbea89
Revises: 4b805287551b
Create Date: 2022-11-17 16:07:47.454562

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "3b24f5cbea89"
down_revision = "4b805287551b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "end_user", sa.Column("is_manually_created", sa.Boolean(), nullable=True)
    )
    op.execute("UPDATE end_user SET is_manually_created = FALSE")
    op.alter_column("end_user", "is_manually_created", nullable=False)
    op.add_column(
        "end_user",
        sa.Column("care_airtable_reference", sa.String(length=32), nullable=True),
    )


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("end_user", "care_airtable_reference")
    op.drop_column("end_user", "is_manually_created")
    # ### end Alembic commands ###
