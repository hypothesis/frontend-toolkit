#!/usr/bin/env python3

import argparse
import re
from subprocess import run
import textwrap
from os import getenv
from subprocess import PIPE
from sys import exit, stderr

import dateutil.parser
import requests

GITHUB_API_URL = 'https://api.github.com'


class PRInfo(object):
    def __init__(self, id, title):
        self.id = id
        self.title = title


def pr_link(repo, id):
    """Return a link to a GitHub Pull Request in markdown format"""

    return '[#{id}](https://github.com/{repo}/pull/{id})'.format(id=id, repo=repo)


def get_last_tag():
    proc = run(['git','tag','--list','--sort=-taggerdate'],
        stdout=PIPE)
    tags = proc.stdout.decode().splitlines()

    if tags:
        return tags[0]
    else:
        return None


def get_tag_date(tag):
    tag_date_result = run(['git', 'tag', '--list', tag, '--format=%(taggerdate)'],
        stdout=PIPE)
    tag_date_str = tag_date_result.stdout.decode().strip()
    return dateutil.parser.parse(tag_date_str)


def github_request(auth_token, repo, path, **kwargs):
    """
    Make a GitHub API request and return an iterator over items in the response.

    `github_request` follows `next` links in paged responses automatically.
    """
    params = kwargs
    url = '{}/repos/{}/{}'.format(GITHUB_API_URL, repo, path)
    headers = {}
    if auth_token:
        headers['Authorization'] = 'token {}'.format(auth_token)

    while url:
        res = requests.get(url, headers=headers, params=params)
        if res.status_code != 200:
            raise Exception('GitHub request {} failed:'.format(url), res.text)

        page = res.json()
        if isinstance(page, list):
            for item in page:
                yield item
            try:
                url = res.links['next']['url']
            except KeyError:
                url = None
            params = None
        else:
            yield page
            break


def get_prs_merged_since(auth_token, repo, tag):
    """
    Return all pull requests merged since `tag` was created.

    Pull requests are sorted in ascending order of merge date.
    """
    tag_date = get_tag_date(tag)
    prs = []

    def merge_date(pr):
        if pr.get('merged_at'):
            return dateutil.parser.parse(pr['merged_at'])
        else:
            return None

    # The GitHub API does not provide a `since` parameter to retrieve PRs
    # closed since a given date, so instead we iterate over PRs in descending
    # order of last update and stop when we reach a PR that was last updated
    # before the given tag was created.
    for closed_pr in github_request(auth_token, repo, 'pulls', state='closed',
                                    sort='updated', direction='desc'):
        pr_date = dateutil.parser.parse(closed_pr['updated_at'])
        if pr_date < tag_date:
            break
        merged_at = merge_date(closed_pr)
        if merged_at and merged_at > tag_date:
            prs += [closed_pr]

    return sorted(prs, key=merge_date)


def format_list(items):
    def format_item(item, col_width):
        formatted = ''
        for line in iter(textwrap.wrap(item, col_width - 2)):
            if len(formatted) == 0:
                formatted = formatted + '- ' + line
            else:
                formatted = formatted + '\n  ' + line
        return formatted

    return '\n\n'.join([format_item(item, 80) for item in items])


def current_github_repo(remote='origin'):
    """
    Return the GitHub repository and organization associated with a Git remote.

    This function assumes that `remote` has a SSH or HTTPS URL containing
    'github.com' and ending with '{org}/{repo}.git'.
    """

    proc = run(['git', 'remote', 'get-url', remote], stdout=PIPE)
    url = proc.stdout.strip().decode('utf-8')

    if 'github.com' in url:
        match = re.search('([^:/]+)/([^/]+)\.git$', url)
        org = match.group(1)
        repo = match.group(2)
        return (org, repo)
    else:
        return None

    
def main():
    parser = argparse.ArgumentParser(description=
"""
Generates a list of changes since the last tag was created, in the format
recommended by http://keepachangelog.com.
"""
)

    current_repo = ''
    try:
        (org, repo) = current_github_repo()
        current_repo = '{}/{}'.format(org, repo)
    except TypeError:
        pass

    parser.add_argument('--tag', default=get_last_tag(), help='The tag to list changes since')
    parser.add_argument('--repo', default=current_repo, help='The GitHub repository to generate a change list for')
    parser.add_argument('--token', default=getenv('GITHUB_TOKEN'), help='GitHub API access token')
    args = parser.parse_args()

    if not args.repo:
        print('Could not determine current GitHub repo. Use the --repo argument',file=stderr)
        exit(1)

    if not args.tag:
        print('Could not find last tag. Use the --tag argument', file=stderr)
        exit(1)

    pr_details = []
    for pr in get_prs_merged_since(args.token, args.repo, args.tag):
        pr_details += [PRInfo(pr['number'], title=pr['title'].strip())]

    def item_label(pr):
        return '{} ({}).'.format(pr.title, pr_link(args.repo, pr.id))

    print("""
****
Changes since {repo} {tag}:

Please edit the output below before including it in the change log.
See http://keepachangelog.com for further advice.

Only include changes which are interesting to users of the package or
application, and use a description they will be able to understand.
****

[Unreleased]
""".format(repo=args.repo, tag=args.tag))
    print(format_list([item_label(pr) for pr in pr_details]))


if __name__ == '__main__':
    main()
