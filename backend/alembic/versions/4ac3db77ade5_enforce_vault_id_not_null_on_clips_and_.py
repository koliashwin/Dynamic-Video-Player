"""enforce vault_id not null on clips and sections

Revision ID: 4ac3db77ade5
Revises: d40f66c7d31e
Create Date: 2026-08-18 13:14:32.021343

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4ac3db77ade5'
down_revision: Union[str, Sequence[str], None] = 'd40f66c7d31e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Wrap 'clips' inside a batch context
    with op.batch_alter_table('clips', schema=None) as batch_op:
        batch_op.alter_column('vault_id',
               existing_type=sa.INTEGER(),
               nullable=False)
               
    # Wrap 'sections' inside a batch context
    with op.batch_alter_table('sections', schema=None) as batch_op:
        batch_op.alter_column('vault_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('sections', schema=None) as batch_op:
        batch_op.alter_column('vault_id',
               existing_type=sa.INTEGER(),
               nullable=True)
               
    with op.batch_alter_table('clips', schema=None) as batch_op:
        batch_op.alter_column('vault_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    # ### end Alembic commands ###
