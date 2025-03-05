# WeConnect Client

This WeConnect Client repository contains a React Javascript application. 

Interested in [volunteering or applying for an internship](https://wevote.applytojob.com/apply)? [Starting presentation here](https://prezi.com/p/6iu9aks7zqvs/?present=1). 
Please also [read about our values](https://docs.google.com/document/d/12qBXevI3mVKUsGmXL8mrDMPnWJ1SYw9zX9LGW5cozgg/edit) and 
[see our Code of Conduct](CODE_OF_CONDUCT.md)
To join us, please [review our openings here](https://wevote.applytojob.com/apply), and apply for a volunteer position through that page.

Our current version is here [https://WeVote.US](https://WeVote.US) and we are working on a new version now!


Our installation process is built to allow engineers all over America to contribute.
It may seem complicated, but it allows anyone to be in a position to make suggestions, and get involved.

## Installing the React weconnect-client

These instruction assume that you are installing on a Mac.  If you use Windows or Linux, the installation procedure should be similar.

This procedure is based on using the free Community edition of WebStorm, which has great Git integration, 
a great integrated Node debugger, and has an excellent editor.  

If you have the paid version of WebStorm the instructions should be the same.  

**If you have some other preferred editor, we recommend that you still do this install, and then use your other editor as you wish!**
<br><br>

### If you don't already have one, create an account in [GitHub](https://github.com/)
[GitHub](https://github.com/) is where WeVote stores the source code for our various projects.
<br><br>

### Download and install WebStorm
The free Community edition is at https://www.jetbrains.com/webstorm/

License it as a free Community installation.

Once installed, start WebStorm from Launch Pad or Spotlight

<img src="docs/images/WelcomeToWebStorm.png" alt="Alt Text" width="600" >

The first step is to press that "Clone Repository" button to clone the https://github.com/wevote/weconnect-client repository.
Enter the URL and press the Clone button.

<img src="docs/images/WebstormCloneRepository.png" alt="Alt Text" width="600" >

Now the latest code is on your machine.

<img src="docs/images/CodeInstalledInWebStorm.png" alt="Alt Text" width="1200" >
<br><br>

### Configure the WebStorm display mode
If you like the default white characters on a black background, skip this step.

Access the settings dialog from the gear icon in the upper right hand side of the WebStorm app.
Set the Theme as you would like, or have it "Sync with OS" (which is my preference), and then save.
<br><br>

<img src="docs/images/WebStormAppearanceSettings.png" alt="Alt Text" width="700" >
<br><br>

### About WebStorm plugins
Plugins extend the capability of WebStorm and are worth exploring.  If it sounds good, we usually install them, unless the suggestions are for off-topic for what we are useing WebStorm for today.
Plugins suggested by WebStorm are safe to install, and easy to remove if you don't like them.
<br><br>

### Run 'npm install'
If WebStorm prompts you to run "npm install" feel free to do it anytime.   

<img src="docs/images/NpmInstall.png" alt="Alt Text" width="1200" >

"npm install" updates all the dependencies (node_modules i.e. libraries) that we import from other projects, and should never be a problem.

"npm install" will often show lots of outdated libraries, and vulnerabilities ... WeVote gets
reports on these issues, and we resolve them periodically.  Don't worry about the warnings at this poin.t



### Install Homebrew (If it is not already installed)
If your version of WebStorm displays a green arrow to the left of the following command,
click it to install  [Homebrew](https://brew.sh/).  

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Clicking the command results in the following output in the terminal
window.  You will need your login password to allow MacOS to install
Homebrew.  When it prompts you for an ENTER you can click in the terminal, and press Enter.

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
stevepodell@Steves-MBP-M1-Dec2021 weconnect-client % /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
==> Checking for `sudo` access (which may request your password)...
Password:
==> This script will install:
/opt/homebrew/bin/brew
/opt/homebrew/share/doc/homebrew
/opt/homebrew/share/man/man1/brew.1
/opt/homebrew/share/zsh/site-functions/_brew
/opt/homebrew/etc/bash_completion.d/brew
/opt/homebrew

Press RETURN/ENTER to continue or any other key to abort:
```
Homebrew will load the "formulae", (their cutesy name for scripts that install all sorts of
free open source programs).  If you already had Homebrew installed, it will update
any ("taps" which are "formulae" that were already installed).

When Homebrew completes it will leave the "RunMarkdown" terminal window at 
a MacOS (Linux) prompt.

You will now use Homebrew to install some more applications.
<br><br>

### Install Node
This project has a few scripts that run in Node, get the latest version of at least 22.0<br>
If you have an earlier version of Node installed, you will need to reinstall it.

Check your node version via the terminal (This computer was at V18, and needed to be upgraded.  Node had been previously installed with
Homebrew.  "homebrew" is in the path to the Node executable (`/opt/homebrew/bin/node`), so we know it was installed with Homebrew.)

```
stevepodell@Steves-MacBook-Air weconnect-client % which node             
/opt/homebrew/bin/node
stevepodell@Steves-MacBook-Air weconnect-client % node -v
v18.10.0
stevepodell@Steves-MacBook-Air weconnect-client % 
```

If your computer did not have Node installed with Homebrew, you will have to research how to upgrade your installation of Node.

If Node was installed with Homebrew or you have never installed Node, continue...

```bash
  stevepodell@Steves-MacBook-Air weconnect-client % brew install node@22
  ...
  ==> Caveats
  node@22 is keg-only, which means it was not symlinked into /usr/local,
  because this is an alternate version of another formula.
   
  If you need to have node@22 first in your PATH, run:
     echo 'export PATH="/usr/local/opt/node@22/bin:$PATH"' >> ~/.zshrc

  For compilers to find node@22 you may need to set:
    export LDFLAGS="-L/usr/local/opt/node@22/lib"
    export CPPFLAGS="-I/usr/local/opt/node@22/include"
  ==> Summary
🍺  /usr/local/Cellar/node@22/22.11.0: 2,628 files, 83.7MB
  ==> Running `brew cleanup node@22`...
  Disable this behaviour by setting HOMEBREW_NO_INSTALL_CLEANUP.
  Hide these hints with HOMEBREW_NO_ENV_HINTS (see `man brew`).
  stevepodell@Steves-MacBook-Air weconnect-client % 
```
If Homebrew asks you to make the following 4 manual changes to link in Node.  Execute these 4 lines in your terminal.
```bash
stevepodell@Steves-MacBook-Air weconnect-client % echo 'export PATH="/usr/local/opt/node@22/bin:$PATH"' >> ~/.zshrc
stevepodell@Steves-MacBook-Air weconnect-client % echo 'export PATH="/usr/local/opt/node@22/bin:$P                 
stevepodell@Steves-MacBook-Air weconnect-client % export LDFLAGS="-L/usr/local/opt/node@22/lib"
stevepodell@Steves-MacBook-Air weconnect-client % export CPPFLAGS="-I/usr/local/opt/node@22/include"
stevepodell@Steves-MacBook-Air weconnect-client % 
```
Then confirm the version of Node is greater than V22, open a new terminal window (with the "+" icon) and type

```
stevepodell@Steves-MacBook-Air weconnect-client % node -v
v22.11.0
stevepodell@Steves-MacBook-Air weconnect-client % 
```
<br><br>

### Set up your Git remotes within WebStorm

<img src="docs/images/ManageRemotesMenu.png" alt="Alt Text" width="1200" >

At WeVote we use different naming conventions for `origin` and `upstream` than you might be familiar with from other projects, so you
will need to rename the default git origin (which at WeVote is your private branch in GitHub
)

<img src="docs/images/GitRemoteOriginBefore.png" alt="Alt Text" width="500" >

Edit the origin line, and change the name to upstream, then press OK

<img src="docs/images/GitRemoteUpstreamAfter.png" alt="Alt Text" width="500" >

Then press the + button and set up the new value for “origin”.
(DON’T USE SailingSteve — use your GitHub handle — the GitHub username that is in the URL after you sign in to GitHub .)

<img src="docs/images/GitOriginMine.png" alt="Alt Text" width="500" >

You may have to authenticate with GitHub at this point, after authenticating, continue...

When done, your remotes will look something like this (with your GitHub handle instead of SailingSteve!)

<img src="docs/images/GitRemotesDone.png" alt="Alt Text" width="500" >

At this point you are poised to make Git branches and pull requests.
<br><br>

### Load all the Node packages that we use in the weconnect-client
If you haven't already done this via a prompt from Webstorm, type
```
stevepodell@Steves-MacBook-Air weconnect-client % npm install
```
You can run this command as often as you want, and it will cause no harm.
<br><br>

### Make a live copy of .env-template to the .env file

Right-click on the `config-template.js` file in Webstorm, and copy it, then paste it as `config.js`

<img src="docs/images/WebstormCopySelection.png" alt="Alt Text" width="1200" >
<img src="docs/images/WebstormPaste.png" alt="Alt Text" width="1200" >

Open `config.js` in WebStorm by double-clicking on it

<img src="docs/images/WebstormEditConfig.png" alt="Alt Text" width="1200" >

Modify the `DATABASE_URL` line by substituting your Postgres username and password, and then save.

Here is a filled in example:

```
DATABASE_URL=postgresql://jerrygarcia:jerryspassword@localhost:5432/WeConnectDB?schema=public
```
<br><br>


### Not now, but when you want to add a column in the future
**Don't do this now!**

But someday, when you add a column or a new schema (table)...

After editing or creating your schema/?.prisma file

run `prisma migrate dev`

### Add a Run Configuration in WebStorm to start the weconnect-client

Open the pull-down that initially says "Current File", and select Edit Configurations
<br>
<img src="docs/images/RunConfigMenu.png" alt="Alt Text" width="400" style="border: 1px solid lightgrey;"><br>

In the Run/Debug Configurations dialog, press the "+" button and then select "Node.js"
<img src="docs/images/SelectNodeFromList.png" alt="Alt Text" width="600" ><br>
Then fill in the run configuration...
1) Enter `Start weconnect-client` in the Name field
2) Enter `weconnect-client.js` in the File field.
3) And press "OK" to save
   <br><img src="docs/images/NodeConfigFillIn.png" alt="Alt Text" width="600" >
   <br><br>

### Create a run config to start postgres
Next create a run config to start postgres
1) Add another "New Configuration", this time for a Shell Script (close to the bottom of the list of configurations on the right)
2) In this "Run/Debug Configurations" dialog, add a name "Start Postgres"
3) In the "Script Path" paste in `/usr/local/opt/postgresql@14/bin/postgres`
   in the "Script Options" paste in `-D /usr/local/var/postgresql@14`
4) Remove any text in the "Interpreter Path" field.
5) Make sure "Execute in the terminal" is checked
6) Then press OK to save

<img src="docs/images/PostgresConfigFillIn.png" alt="Alt Text" width="600" >

(This run configuration is the equivalent of typing

````/usr/local/opt/postgresql@14/bin/postgres -D /usr/local/var/postgresql@14````

in the terminal.)
<br><br>

### Install pgadmin4, a Mac based browser app for the postgres database
```
stevepodell@Steves-MacBook-Air weconnect-client % brew install --cask pgadmin4
```
This will take a few minutes, when it completes launch the app from Launch Pad or Spotlight

Register the server as WeVoteServer

<img src="docs/images/RegisterTheServer.png" alt="Alt Text" width="600" >

And in the Connection tab set the Host name as localhost — also add your postgres Username and Password, then save

<img src="docs/images/RegisterPgAdminHost.png" alt="Alt Text" width="600" >
<br><br>

On the left pane "Object Explorer" right click on "Databases" and add the "WeConnectDB"

### Use the Prisma ORM to "migrate" the database and table definitions to the postgres server

Generate the schema from prisma/schema.prisma to node_modules
```
stevepodell@Steves-MacBook-Air weconnect-client % prisma generate
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 73ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22

stevepodell@Steves-MacBook-Air weconnect-client % 
```

Initialize the generated schema into the postgres database server.
```
stevepodell@Steves-MacBook-Air weconnect-client %  prisma migrate dev --name init
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "WeConnectDB", schema "public" at "localhost:5432"

Applying migration `20241126190549_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20241126190549_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 104ms


stevepodell@Steves-MacBook-Air weconnect-client % 
```
<br><br>


### Start the app!
First start postgres via the run configuration

<img src="docs/images/StartPostgres.png" alt="Alt Text" width="400" style="border: 1px solid lightgrey;">

Then start weconnect-client.js with the run configuration.
<br><br><img src="docs/images/StartTheApp.png" alt="Alt Text" width="1200" >

As you can see when you press the Green start arrow, the server starts up in a terminal window where you can see
logging.  Any `console.log()` lines that you put in the code will appear in this JavaScript console for this Node based server (which has no DOM).

Alternatively if you press the green bug icon, you start a debugging session, where you can set breakpoints, examine threads,  and examine data
in a familiar way to what you might be used to with Chrome Dev Tools (Inspect) or debugging in PyCharm.

<img src="docs/images/StartDebug.png" alt="Alt Text" width="1200" >
<br><br>

### View the app in the Chrome browser

When you navigate in Chrome to `http://localhost:4000/` you will see the client view of app (in these early days the UI is
generated on the server via the Pug UI package), this UI of course is rendered as a DOM within Chrome,
and as with any web app, right-clicking on the page and choosing Inspect, will allow you to run the Chrome Dev Tools.

<img src="docs/images/AppInChrome.png" alt="Alt Text" width="1200" >


