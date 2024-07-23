from modules.database.migration import DataMigration

revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}


async def upgrade(op: DataMigration.Operation):
    ${upgrades if upgrades else "raise NotImplemented"}


async def downgrade(op: DataMigration.Operation):
    ${downgrades if downgrades else "raise NotImplemented"}
