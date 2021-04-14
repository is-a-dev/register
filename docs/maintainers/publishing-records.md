# Publishing records
> NOTE: This is only for maintainers with publishing access

Currently, the records are published using a manual github actions workflow.
When all the PR's are merged and ready, go to `Actions > Publish records` and click on the `Run workflow` button to publish the merged records.



Sometimes it may log an error message while publishing saying some record(s) couldn't be published.
Usually, the cause is related to some conflict while deleting and re-publishing.
In those situations, running the workflow again will fix the issues.
