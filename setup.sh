#!/bin/bash

if ! ruby --version; then
    echo ERROR: Ruby is not installed on this machine. Please install ruby manually before you proceed
    exit 1
fi

if ! brew --version; then
    echo Brew was not found on this machine, installing...
    ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
fi

brew install graphicsmagick