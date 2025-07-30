# Welcome to Eleuteria Writing Studio

## Project info

**URL**: https://lovable.dev/projects/130b1ba2-93d1-4c94-a455-269e9c7ca3b5

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

Follow these steps:
we use fnm (as system control version manager for Node.js) https://github.com/Schniz/fnm

You need to install Python 3.13 before run our installation scripts, which you can download from here:
https://www.python.org/downloads/release/python-3135/. Install the one you need for your OS.

Installation steps:

```sh
# Step 1: Install fnm (Fast Node Manager) to manage Node.js versions.
brew install fnm
# Step 2: install and use the node js version with this
fnm use

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run start
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Fast API

## Naming conventions for PRs

| Type       | When to use?                                                 |
| ---------- | ------------------------------------------------------------ |
| `feat`     | New functionality                                            |
| `fix`      | Bug fixes                                                    |
| `refactor` | Change internal structure without change functionality       |
| `chore`    | Minor changes: updates, scripts, lint, configs               |
| `docs`     | Documentation changes                                        |
| `style`    | Format changes, spaces, commas, without impact functionality |
| `test`     | Add or improve tests                                         |
| `perf`     | Improve performance                                          |
| `build`    | Build changes, dependencies, CI/CD                           |

## Current Models And Relations Diagram

![Models And Relations](eleuteria_data_models.drawio.png)

## Backend setup

### To set up and run backend, you have two ways:

#### The Easy Way:

Run our installation script:

- on linux/macos: `./backend/scripts/dependencies-installer.sh`
- on windows: `./backend/scripts/dependencies-installer.ps1`

> Backend will be running on: http://localhost:8000. Front and Back will start together.

#### The Manual Way:

1—Install Poetry dependency manager running the following commands in Terminal:

- MacOS, Linux, WSL: `curl -sSL https://install.python-poetry.org | python3 -`

- Windows PowerShell: `(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -`

  > If you have installed Python through the Microsoft Store, replace "py" with "python" in the command above.

- Export Poetry to your path:
  - Terminal Zsh: `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc`
  - Terminal Bash: `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc`
  - Windows PowerShell: `Add-Content -Path $PROFILE -Value ' $env:Path = "$env:USERPROFILE\.poetry\bin;" + $env:Path'` then: `. $PROFILE`

2—After Poetry installation:

- run: `poetry config virtualenvs.in-project true`
- then run: `cd backend && poetry env activate`
- copy, paste and run the command it shows (should start with "source").

3—Install dependencies with:

- `poetry install`

4—you can run: `npm run dev-backend`.

5—Backend will be running on: http://localhost:8000

## Backend API Documentation

APIs: http://localhost:8000/redoc

## Manuscript sync use a different Backend

This part of the backend is made in Rust, so you have to install `Cargo` following the steps on this URL:

https://doc.rust-lang.org/cargo/getting-started/installation.html

Once done, you can do this:

- `cd backend-rust`
- `cargo run`
- WebSocket will be running at: `ws://localhost:9001/manuscript`

## Backend Testing

run tests with test coverage: `npm run test-backend`
