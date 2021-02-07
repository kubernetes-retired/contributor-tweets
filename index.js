const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const { exit } = require('process');

Date.prototype.ddmmyyyy = function() {
    var mm = this.getMonth() + 1;
    var dd = this.getDate();
  
    return [(dd>9 ? '' : '0') + dd,
            (mm>9 ? '' : '0') + mm,
            this.getFullYear(),
            this.getUTCHours(),
            this.getUTCMinutes()
           ].join('-');
};

Date.prototype.mmddyyyy = function() {
    var mm = this.getMonth() + 1;
    var dd = this.getDate();
  
    return [(mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd,
            this.getFullYear(),
            this.getUTCHours(),
            this.getUTCMinutes()
           ].join('-');
};

try {
    
    var eventName = github.context.eventName
    
    core.info("Current run happened for the following trigger: "+eventName)

    if (eventName.startsWith("issue")) {

        // Extract and create the necessary variables and values
        // sort of initialiazition part
        var startingParseSymbol = core.getInput("starting-parse-symbol").trim();
        var fileNameFormat = core.getInput("file-name-format").trim();
        var pathToSave = core.getInput("path-to-save").trim();
        var fileNameExtension = core.getInput("file-name-extension").trim();
        var githubToken = core.getInput('token');
        var tweetLength = core.getInput('tweet-length');
        
        var issueContext = github.context.payload.issue.body;
        var issueNumber = github.context.payload.issue.number;
        var issueTitle = github.context.payload.issue.title;

        var parseSymbolFirstIndex = issueContext.indexOf(startingParseSymbol)

        core.info(`The parsing symbol first found @ ${parseSymbolFirstIndex}`)

        if (parseSymbolFirstIndex < 0 ) {        
            core.info("The issue "+issueNumber+" is not for creation of new tweet.")
            core.info("Setting the continue-workflow to false.")
            core.setOutput("continue-workflow", false)
            exit(0)
        }

        var parseSymbolLastIndex = issueContext.lastIndexOf(startingParseSymbol)
        var tweetContent = issueContext.substring(parseSymbolFirstIndex + startingParseSymbol.length, parseSymbolLastIndex);
        var sanitizedTweetContent = tweetContent.replace( /[\r\n]+/gm, "" )

        core.info(`
        ===========================================================================
        Tweet content:
            ${sanitizedTweetContent}
        ===========================================================================
        `)

        if (sanitizedTweetContent.length > 0)  {
            core.info("Setting the contibue-workflow to TRUE.")
            core.setOutput("continue-workflow", true)
        } else {
            core.info("The issue "+issueNumber+" is not for creation of new tweet.")
            core.info("Setting the continue-workflow to false.")
            core.setOutput("continue-workflow", false)
            exit(0)
        }

        // TBD: uncomment when scheduled time is enabled.
        // var tweetScheduleTime = issueContext.substring(issueContext.indexOf("Time:")+5, issueContext.length).trim();

        var fileNameDate, completeFileName;
        var issueTitle30Chars = issueTitle.substring(0,30);
        var sanitizedIssueTitle = issueTitle30Chars.replace(/[^a-zA-Z0-9]/g,'-').trim().slice(0, -1);

        // Validate the given timestamp is valid time and return null, 
        // if not valid, throws an error and exits.
        // TBD: uncomment when scheduled time is enabled.
        // validateTimestamp(tweetScheduleTime, githubToken)

        // Validates the length of the tweet content
        if (sanitizedTweetContent.length > tweetLength) {
            commentToIssue(
                "Tweet content length is exceeding the permitted tweet length. Please rephrase the tweet and comment /validate to trigger the workflow again.",
                githubToken
            )
            core.setFailed("Tweet content length is exceeding the permitted tweet length. Please rephrase the tweet.")
            core.info("Setting the continue-workflow to false.")
            core.setOutput("continue-workflow", false)
        } else {
            core.info(`The tweet content is ${sanitizedTweetContent}`);

            // Creates the new file to be committed into the repo.
            if (!fs.existsSync(pathToSave)){
                fs.mkdirSync(pathToSave, { recursive: true });
            }
        
            core.info(`    
                The symbol declared for parsing is ${startingParseSymbol}
                The file name format is specified as ${fileNameFormat}
                The file name extension is specified as ${fileNameExtension}
                The path to save the file is specified as ${pathToSave}
                Sanitized issue title is ${sanitizedIssueTitle}

            `);
            // TBD: uncomment when scheduled time is enabled and move into the brace above.
            // Scheduled tweet time is ${tweetScheduleTime}
            // TBD: remove the below assignment to tweetScheduleTime
            var tweetScheduleTime = ""
            if (tweetScheduleTime === "") {
                core.info("Scheduled time is null, creating the file name with the specified format.")
                var date = new Date();
                if (fileNameFormat === "dd-mm-yyyy-hh-MM") {
                    fileNameDate = date.ddmmyyyy();
                } else if (fileNameFormat === "mm-dd-yyyy-hh-MM") {
                    fileNameDate = date.mmddyyyy();
                }
                completeFileName = fileNameDate+sanitizedIssueTitle+"."+fileNameExtension
                core.info(`File name to be saved as ${completeFileName}`)
            } else {
                fileNameDate = new Date(tweetScheduleTime).toJSON().replace(/[^a-zA-Z0-9]/g,'-').trim().slice(0, -1)
                completeFileName = fileNameDate+sanitizedIssueTitle+"."+fileNameExtension
                core.info(`File name to be saved as ${completeFileName}`)
            }
            const dataFilePath = pathToSave+'/'+completeFileName;
            fs.writeFile(dataFilePath, sanitizedTweetContent, (err) => {
                if (err) throw err;
            });
        
            core.info("Parsing done, commenting on issue.")
        
            commentToIssue(
                "A new file has been created with your tweet content. Please refer the below linked PR",
                githubToken
            )    
        }

        core.setOutput("issueNumber", issueNumber);
    } else if (eventName.startsWith("pull_request")) {
        core.info("TBD: Pull Request job")
    }
} catch (error) {
    core.setFailed(error.message);
}

// Validates the provided time is valid time format
function validateTimestamp(tweetScheduleTime, githubToken) {
    if (tweetScheduleTime !== "") {
        var parsedTime = Date.parse(tweetScheduleTime);
        if (isNaN(parsedTime)) {
            commentToIssue(
                "Specified time is not a valid UTC timestamp for the tweet schedule. Please verify and comment /validate to trigger the workflow again",
                githubToken
            )
            core.setFailed("Error occured while parsing the given timestamp. Please provide the time in conventional UTC format as 2020-10-04T16:02:11.029Z")
            core.error("Error occured while parsing the given timestamp. Please provide the time in conventional UTC format as 2020-10-04T16:02:11.029Z")
        }
    }
}


// Commenting back to issue with provided message
function commentToIssue(body, githubToken) {
    github.getOctokit(githubToken).issues.createComment({
        issue_number: github.context.issue.number,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        body: body
    });
}