import core from '@actions/core';
import github from '@actions/github';
import { Octokit } from '@octokit/action';

const cancelAction = async () => {
    if (core.getInput('GITHUB_TOKEN')) {
        const octokit = new Octokit();

        await octokit.actions.cancelWorkflowRun({
            ...github.context.repo,
            run_id: github.context.runId,
        });

        // Wait a maximum of 1 minute for the action to be cancelled.
        await new Promise(resolve => setTimeout(resolve, 60000));
    }

    // If no GitHub token or timeout has passed, fail action.
    process.exit(1);
};

const runAction = async () => {
    const { payload } = github.context;
    const { comment } = payload;

    if (!comment) {
        console.log('Action triggered on non-comment event.');
        await cancelAction();
        return;
    }

    const bot_name = core.getInput('bot_name');

    if (comment.user.login !== bot_name) {
        console.log('Comment did not originate from bot.', {
            bot_name,
        });
        await cancelAction();
    }

    const cancel_pattern = core.getInput('cancel_pattern');

    if (cancel_pattern && new RegExp(cancel_pattern).test(comment.body)) {
        console.log('Comment contained pattern that should cancel the action.', {
            cancel_pattern,
            comment: comment.body,
        });
        await cancelAction();
    }

    const url_pattern = new RegExp(core.getInput('url_pattern'));
    const regex_matches = comment.body.match(url_pattern);

    if (!regex_matches) {
        console.log("Unable to find a URL in comment's body.", {
            comment: comment.body,
        });
        await cancelAction();
    }

    const url = regex_matches[1];

    if (url) {
        console.log('Found URL.', { url });
        core.setOutput('url', url);
        process.exit(0);
    } else {
        console.log(
            'The regular expression is in an invalid format. Please ensure the first capture group caputures the URL.'
        );
        process.exit(1);
    }
};

runAction();
