# WeConnect Client

This WeConnect Client repository (weconnect-client) contains a React Javascript application, that is used to manage WeVote
volunteer teams.

<img src="docs/images/AppScreenShot.png" alt="Alt Text" style="width: 600px" >

Interested in [volunteering or applying for an internship](https://wevote.applytojob.com/apply)? [Starting presentation here](https://prezi.com/p/6iu9aks7zqvs/?present=1). 
Please also [read about our values](https://docs.google.com/document/d/12qBXevI3mVKUsGmXL8mrDMPnWJ1SYw9zX9LGW5cozgg/edit) and 
[see our Code of Conduct](https://github.com/wevote/WebApp/blob/435304bc1edd7a8d4d0abdae8c46a533a0ecf52c/CODE_OF_CONDUCT.md)
To join us, please [review our openings here](https://wevote.applytojob.com/apply), and apply for a volunteer position through that page.

The current version of our flagship voter app is here [https://WeVote.US](https://WeVote.US), and we are working on a new version now!

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

<img src="docs/images/WelcomeToWebStorm.png" alt="Alt Text" style="width: 600px" >

The first step is to press that "Clone Repository" button to clone the https://github.com/wevote/weconnect-client repository.
Enter the URL and press the Clone button.

<img src="docs/images/WebstormCloneRepository.png" alt="Alt Text" style="width: 600px" >

Now the latest code is on your machine.

<img src="docs/images/CodeInstalledInWebStorm.png" alt="Alt Text" style="width: 1200px" >
<br><br>

### Configure the WebStorm display mode
If you like the default white characters on a black background, skip this step.

Access the settings dialog from the gear icon in the upper right hand side of the WebStorm app.
Set the Theme as you would like, or have it "Sync with OS" (which is my preference), and then save.
<br><br>

<img src="docs/images/WebStormAppearanceSettings.png" alt="Alt Text" style="width: 700px" >
<br><br>

### About WebStorm plugins
Plugins extend the capability of WebStorm and are worth exploring.  If it sounds good, we usually install them, unless the suggestions are for off-topic for what we are useing WebStorm for today.
Plugins suggested by WebStorm are safe to install, and easy to remove if you don't like them.
<br><br>

### Run 'npm install'
If WebStorm prompts you to run "npm install" feel free to do it anytime.   

<img src="docs/images/NpmInstall.png" alt="Alt Text" style="width: 400px" >

"npm install" updates all the dependencies (node_modules i.e. libraries) that we import from other projects, and should never be a problem.

"npm install" will often show lots of outdated libraries, and vulnerabilities ... WeVote gets
reports on these issues, and we resolve them periodically.  Don't worry about the warnings at this point.



### Install Homebrew (If it is not already installed)
If you are reading this file in WebStorm, click the green double arrow to the left of the following command,
to install  [Homebrew](https://brew.sh/).  Otherwise, open a terminal window at the bottom of Webstorm, and
paste the following command into the terminal and run it.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
The following output will appear in the terminal window.  You will need your login password to allow macOS 
to install Homebrew.  When it prompts you for an "ENTER" you can click in the terminal, and press Enter.

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
Homebrew will load many many "formulae" (their cutesy name for scripts that install all sorts of
free open source programs).  If you already had Homebrew installed, it will update
any ("taps" which are "formulae" that were already installed).

When Homebrew completes it will leave the terminal window at a macOS (Linux) prompt.

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

<img src="docs/images/ManageRemotesMenu.png" alt="Alt Text" style="width: 1200px" >

At WeVote we use different naming conventions for `origin` and `upstream` than you might be familiar with from other projects, so you
will need to rename the default git origin (which at WeVote is your private branch in GitHub
)

<img src="docs/images/GitRemoteOriginBefore.png" alt="Alt Text" style="width: 500px" >

Edit the origin line, and change the name to upstream, then press OK

<img src="docs/images/GitRemoteUpstreamAfter.png" alt="Alt Text" style="width: 500px" >

Then press the + button and set up the new value for “origin”.
(DON’T USE SailingSteve — use your GitHub handle — the GitHub username that is in the URL after you sign in to GitHub .)

<img src="docs/images/GitOriginMine.png" alt="Alt Text" style="width: 500px" >

You may have to authenticate with GitHub at this point.  After completing the GitHub authentication, continue...

When done, your remotes will look something like this (with your GitHub handle instead of SailingSteve!)

<img src="docs/images/GitRemotesDone.png" alt="Alt Text" style="width: 500px" >

At this point you are poised to make Git branches and pull requests.
<br><br>

### Load all the Node packages that we use in the weconnect-client
If you haven't already done this via a prompt from Webstorm, type
```
stevepodell@Steves-MacBook-Air weconnect-client % npm install
```
You can run this command as often as you want, and it will cause no harm.
<br><br>

### Make a live copy of config-template.js to the config.js file

Right-click on the `config-template.js` file in Webstorm, and copy it, then paste it as `config.js`

<img src="docs/images/WebstormCopySelection.png" alt="Alt Text" style="width: 1200px" >
<img src="docs/images/WebstormPaste.png" alt="Alt Text" style="width: 600px" >

If WebStorm did not automatically open `config.js` in a tab, then double click it in the Project pane to open it
for editing.

<img src="docs/images/WebstormEditConfig.png" alt="Alt Text" style="width: 1200px" >

### Setup the connection to a weconnect-server (API server)

**Option 1:**  Use the weconnect-server running in Amazon AWS

   Note: As of March 5, 2025 the weconnect-server is not yet running in Amazon AWS cloud, so this option is not available.

This is all you need if initially you will not be developing new API endpoints, and you won't initially need to debug 
aPI server side code.  

Uncomment these four STAFF_API_SERVER_ lines, and make sure the other two sets of lines like this are commented out.

```
  //// Connecting to live WeConnect APIs ////
  // STAFF_API_SERVER_ROOT_URL: 'https://weconnectserver.org/',
  // STAFF_API_SERVER_ADMIN_ROOT_URL: 'https://weconnectserver.org/admin/',
  // STAFF_API_SERVER_API_ROOT_URL: 'https://weconnectserver.org/apis/v1/',
  // STAFF_API_SERVER_API_CDN_ROOT_URL: 'https://cdn.weconnectserver.org/apis/v1/',
```


**Option 2:**  Run a weconnect-server instance on your computer using https SSL/TLS

In this case you will have already setup the [weconnect-server](https://github.com/wevote/weconnect-server) and postgres on your computer and have it running.

For this option you will need to get the wevotedeveloper.com certificates from Dale.

Uncomment these four STAFF_API_SERVER_ lines, and make sure the other two sets of lines like this are commented out.

```
  //// weconnect-server local server running SSL/TLS HTTPS
  // STAFF_API_SERVER_ROOT_URL: 'https://wevotedeveloper.com:4500/',
  // STAFF_API_SERVER_ADMIN_ROOT_URL: 'https://wevotedeveloper.com:4500/admin/',
  // STAFF_API_SERVER_API_ROOT_URL: 'https://wevotedeveloper.com:4500/apis/v1/',
  // STAFF_API_SERVER_API_CDN_ROOT_URL: 'https://wevotedeveloper.com:4500/apis/v1/',
```


**Option 3:** (Not recommended)  Run a non-secure weconnect-server instance on your computer using http

This may work for some limited purposes, but your session may not be maintained as you navigate to the React app in 
different tabs on your browser, and you may have authentication problems, or API query response problems.

Uncomment these four STAFF_API_SERVER_ lines, and make sure the other two sets of lines like this are commented out.
```
   //// Connecting to local WeConnect "weconnect-server" APIs ////
   // STAFF_API_SERVER_ROOT_URL: 'http://localhost:4500/',
   // STAFF_API_SERVER_ADMIN_ROOT_URL: 'http://localhost:4500/admin/',
   // STAFF_API_SERVER_API_ROOT_URL: 'http://localhost:4500/apis/v1/',
   // STAFF_API_SERVER_API_CDN_ROOT_URL: 'http://localhost:4500/apis/v1/',
```

Not in this project, but in the **weconnect-server project** on your computer, change the PROTOCOL line in the .env file from 
`PROTOCOL=https://` to `PROTOCOL=http://` and restart the weconnect-server, and then it will come up in http mode.

### Add a Run Configuration in WebStorm to start the weconnect-client

Open the pull-down that initially says "Current File", and select Edit Configurations
<br>
<img src="docs/images/RunConfigMenu.png" alt="Alt Text" style="width: 400px; border: 1px solid lightgrey;"><br>

In the Run/Debug Configurations dialog, press the "+" button and then select "Node.js"
<img src="docs/images/SelectNpmFromList.png" alt="Alt Text" style="width: 600px" ><br>
Then fill in the run configuration...
1) Enter `Start weconnect-client` in the Scripts field. 
2) And press "OK" to save
   <br><img src="docs/images/NpmConfigFilledIn.png" alt="Alt Text" style="width: 600px" >
   <br><br>

### Start the app!
First start postgres via the run configuration

As you can see when you press the Green start arrow, the server starts up in a terminal window where you can see
some logging from the Webpack server program.  The `run start` starts up the Webpack server, which listens for any changes to the files in your IDE and then 
automatically 'recompiles' and 'redeploys' the changes to your browser.

Webpack takes a minute or two to start up, but then it recompiles in less that a second.  As you make changes in your code
you will see the line that says something like `webpack 5.97.1 compiled successfully in 795 ms` change for each compile.
Webpack will eventually see the changes to you code when Webstorm automatically saves the file, but you can get those
recompiles to happen instantly by either pressing the save floppy-disk icon on the top row, or by pressing Command+S

In your browser you can press Control+Shift+R to reload the page with the latest from Webpack (although this also will 
happen automatically after a few seconds).  Control+Shift+R guranatees a full reload, which sometimes does not happen
if modal dialogs or drawers are open.

Debugging of the code is done with Chrome Dev-tools, which can be invoked by right-clicking anywhere on the page, and 
selecting 'Inspect' at the bottom of the right-click menu.

### View the app in the Chrome browser

When you navigate in Chrome to `http://localhost:4000/` you will see the client login page.

Sometime in 2025, Chrome stopped loading locally defined websites, even if they have valid public SSL certificates, 
so if you use chrome, you will have to use http.  This is not a problem on our publicly deployed instance at 
`https://team.wevote.org`, Chrome works perfectly well at our public site.


### View the app in the Safari browser

When you navigate in Safari to `https://wevotedeveloper.com:4000/` you will see the client login page.

Safari has a devtools like feature called "WebInspector" that is highly equivalent to devtools in Chrome.

If you are running Chrome pointed to localhost, and you find some feature that doesn't work, give Safari a try.

