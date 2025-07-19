#!/bin/bash

echo "Installing Poetry..."
curl -sSL https://install.python-poetry.org | python3 -

echo "Adding Poetry to PATH..."
SHELL_RC=""
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    echo "bash or zsh not detected. Manually add Poetry to your PATH."
    exit 1
fi

echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
source "$SHELL_RC"

echo "Configuring Poetry..."
poetry config virtualenvs.in-project true

echo "Moving to backend dir..."
cd .. || { echo "'backend' not found"; exit 1; }

echo "Creating Poetry Venv..."
poetry install

echo "Dependencies installed!"
echo ""
echo "To activate your Python virtual environment please run:"
echo "source $(poetry env info --path)/bin/activate"
echo ""
