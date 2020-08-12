# Kubernetes Contributor Tweets

Welcome to Contributor Tweets!

This repository is part of the automation, to tweet from the [K8sContributors](https://twitter.com/k8scontributors) twitter account. If you are looking at posting a tweet from the K8sContributors account, please follow the [instructions](#posting-a-new-tweet) below.

This project is currently owned and maintained by the [SIG Contribex Marketing Team](https://github.com/kubernetes/community/tree/master/communication/marketing-team).

## Automation

The automation is based on [twitter-together](https://github.com/gr2m/twitter-together) project.

> twitter-together is a GitHub Action that utilizes text files to publish tweets from a GitHub repository. Rather than tweeting directly, GitHub’s pull request review process encourages more collaboration, Twitter activity and editorial contributions by enabling everyone to submit tweet drafts to a project

Everytime a PR with a new `.tweet` file gets merged, the contents of the file will used to send out a tweet **instantly** from the K8sContributors account.

The automation also supports tweet scheduling with the help of [merge-schedule-action](https://github.com/gr2m/merge-schedule-action). To schedule a tweet for a specific day, enter the command `\schedule yyyy-mm-dd` in the PR description. This will tweet on the given day at 12 AM GMT. 

Note: The schedule feature is not supported for PR from fork repos. Therefore, this feature should be investigated further and should be used with caution

Thanks to the team behind **twitter-together** for putting together a wonderful open-source project.

## Posting a new tweet

1. Fork this repository
2. Create a new `.tweet` file with the tweet contents. Make sure the file is as per the [guidelines](GUIDELINES.md)
3. Create a PR to this repository
4. Once the PR is approved and merged, the tweet is sent out from the [K8sContributors account](https://twitter.com/k8scontributors)


## Notes

- Only newly created files are handled, deletions, updates or renames are ignored.
- *.tweet files will not be created for tweets sent out directly from twitter.com
- If you need to rename an existing tweet file, please do so locally using git mv old_filename new_filename, otherwise it may occur as deleted and added which would trigger a new tweet.

## Contribute

We are always looking for people to help us improve the automation. Look at our [contributing guide](CONTRIBUTING.md) to get started.

Please feel free to join our [weekly meetings](https://github.com/kubernetes/community/tree/master/sig-contributor-experience#community-management) or reach out to the maintainers of this project.

For adding features to the Github actions, we encourage to make upstream contributions to the [twitter-together](https://github.com/gr2m/twitter-together) project and then use the new feature downstream here. 

## Code of conduct

Participation in the Kubernetes community is governed by the [Kubernetes Code of Conduct](code-of-conduct.md).

[owners]: https://git.k8s.io/community/contributors/guide/owners.md
[Creative Commons 4.0]: https://git.k8s.io/website/LICENSE
