"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const action_1 = require("@octokit/action");
const cancelAction = () => __awaiter(void 0, void 0, void 0, function* () {
    if (core_1.default.getInput('GITHUB_TOKEN')) {
        const octokit = new action_1.Octokit();
        yield octokit.actions.cancelWorkflowRun(Object.assign(Object.assign({}, github_1.default.context.repo), { run_id: github_1.default.context.runId }));
        // Wait a maximum of 1 minute for the action to be cancelled.
        yield new Promise(resolve => setTimeout(resolve, 60000));
    }
    // If no GitHub token or timeout has passed, fail action.
    process.exit(1);
});
const runAction = () => __awaiter(void 0, void 0, void 0, function* () {
    const { payload } = github_1.default.context;
    const { comment } = payload;
    if (!comment) {
        console.log('Action triggered on non-comment event.');
        yield cancelAction();
        return;
    }
    const bot_name = core_1.default.getInput('bot_name');
    if (comment.user.login !== bot_name) {
        console.log('Comment did not originate from bot.', {
            bot_name,
        });
        yield cancelAction();
    }
    const cancel_pattern = core_1.default.getInput('cancel_pattern');
    if (cancel_pattern && new RegExp(cancel_pattern).test(comment.body)) {
        console.log('Comment contained pattern that should cancel the action.', {
            cancel_pattern,
            comment: comment.body,
        });
        yield cancelAction();
    }
    const url_pattern = new RegExp(core_1.default.getInput('url_pattern'));
    const regex_matches = comment.body.match(url_pattern);
    if (!regex_matches) {
        console.log("Unable to find a URL in comment's body.", {
            comment: comment.body,
        });
        yield cancelAction();
    }
    const url = regex_matches[1];
    if (url) {
        console.log('Found URL.', { url });
        core_1.default.setOutput('url', url);
        process.exit(0);
    }
    else {
        console.log('The regular expression is in an invalid format. Please ensure the first capture group caputures the URL.');
        process.exit(1);
    }
});
runAction();
