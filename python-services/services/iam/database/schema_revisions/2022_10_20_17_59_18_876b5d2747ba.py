"""empty message

Revision ID: 876b5d2747ba
Revises: 0963c9b334c9
Create Date: 2022-10-20 17:59:18.631766

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '876b5d2747ba'
down_revision = '0963c9b334c9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('service',
    sa.Column('reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('data_alias', sa.String(length=256), nullable=True),
    sa.Column('create_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('name', sa.String(length=32), nullable=False),
    sa.PrimaryKeyConstraint('reference', name=op.f('pk_esen_iam_service'))
    )
    op.create_index(op.f('ix_esen_iam_service_create_time'), 'service', ['create_time'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_data_alias'), 'service', ['data_alias'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_reference'), 'service', ['reference'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_update_time'), 'service', ['update_time'], unique=False)
    op.create_table('service_access_token',
    sa.Column('reference', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('data_alias', sa.String(length=256), nullable=True),
    sa.Column('create_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_time', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('value', sa.String(length=256), nullable=False),
    sa.Column('expiration_time', sa.DateTime(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('service_reference', postgresql.UUID(as_uuid=True), nullable=True),
    sa.ForeignKeyConstraint(['service_reference'], ['service.reference'], name=op.f('fk_esen_iam_service_access_token_service_reference_service')),
    sa.PrimaryKeyConstraint('reference', name=op.f('pk_esen_iam_service_access_token'))
    )
    op.create_index(op.f('ix_esen_iam_service_access_token_create_time'), 'service_access_token', ['create_time'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_access_token_data_alias'), 'service_access_token', ['data_alias'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_access_token_expiration_time'), 'service_access_token', ['expiration_time'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_access_token_is_active'), 'service_access_token', ['is_active'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_access_token_reference'), 'service_access_token', ['reference'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_access_token_service_reference'), 'service_access_token', ['service_reference'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_access_token_update_time'), 'service_access_token', ['update_time'], unique=False)
    op.create_index(op.f('ix_esen_iam_service_access_token_value'), 'service_access_token', ['value'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_esen_iam_service_access_token_value'), table_name='service_access_token')
    op.drop_index(op.f('ix_esen_iam_service_access_token_update_time'), table_name='service_access_token')
    op.drop_index(op.f('ix_esen_iam_service_access_token_service_reference'), table_name='service_access_token')
    op.drop_index(op.f('ix_esen_iam_service_access_token_reference'), table_name='service_access_token')
    op.drop_index(op.f('ix_esen_iam_service_access_token_is_active'), table_name='service_access_token')
    op.drop_index(op.f('ix_esen_iam_service_access_token_expiration_time'), table_name='service_access_token')
    op.drop_index(op.f('ix_esen_iam_service_access_token_data_alias'), table_name='service_access_token')
    op.drop_index(op.f('ix_esen_iam_service_access_token_create_time'), table_name='service_access_token')
    op.drop_table('service_access_token')
    op.drop_index(op.f('ix_esen_iam_service_update_time'), table_name='service')
    op.drop_index(op.f('ix_esen_iam_service_reference'), table_name='service')
    op.drop_index(op.f('ix_esen_iam_service_data_alias'), table_name='service')
    op.drop_index(op.f('ix_esen_iam_service_create_time'), table_name='service')
    op.drop_table('service')
    # ### end Alembic commands ###
