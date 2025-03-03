"""Create image_document table

Revision ID: 87402ec03a90
Revises: 8a69e1b8e0ac
Create Date: 2025-02-07 18:03:12.153340

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '87402ec03a90'
down_revision = '8a69e1b8e0ac'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('image_document',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('original_filename', sa.String(length=255), nullable=False),
    sa.Column('unique_filename', sa.String(length=255), nullable=False),
    sa.Column('file_path', sa.String(length=500), nullable=False),
    sa.Column('file_extension', sa.String(length=10), nullable=False),
    sa.Column('file_size', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('dimensions', sa.JSON(), nullable=True),
    sa.Column('color_histogram', sa.JSON(), nullable=True),
    sa.Column('processing_history', sa.JSON(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('unique_filename')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('image_document')
    # ### end Alembic commands ###
