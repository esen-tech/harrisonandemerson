"""empty message

Revision ID: aeab01f3a98f
Revises: d9b4aff06a29
Create Date: 2022-11-07 18:06:17.761023

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'aeab01f3a98f'
down_revision = 'd9b4aff06a29'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('organization', sa.Column('operational_state', sa.String(length=32), nullable=True))
    op.add_column('organization', sa.Column('registered_name', sa.String(length=128), nullable=True))
    op.add_column('organization', sa.Column('registered_address', sa.String(length=256), nullable=True))
    op.add_column('organization', sa.Column('registered_medical_specialty', sa.String(length=32), nullable=True))
    op.add_column('organization', sa.Column('registered_organization_code', sa.String(length=32), nullable=True))
    op.add_column('organization', sa.Column('registered_representative_internal_user_reference', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('organization', sa.Column('registered_business_commencement_date', sa.Date(), nullable=True))
    op.drop_column('organization', 'official_key')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('organization', sa.Column('official_key', sa.VARCHAR(length=128), autoincrement=False, nullable=False))
    op.drop_column('organization', 'registered_business_commencement_date')
    op.drop_column('organization', 'registered_representative_internal_user_reference')
    op.drop_column('organization', 'registered_organization_code')
    op.drop_column('organization', 'registered_medical_specialty')
    op.drop_column('organization', 'registered_address')
    op.drop_column('organization', 'registered_name')
    op.drop_column('organization', 'operational_state')
    # ### end Alembic commands ###
