// Decompiled with JetBrains decompiler
// Type: Wyam.Git.GitKeys
// Assembly: Wyam.Git, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 28CB8FE7-54F8-43EA-A60F-3B31EA2C7128
// Assembly location: C:\Users\mlopez\Downloads\wyam.git.1.0.0\lib\net462\Wyam.Git.dll

namespace Wyam.SlightBlog.Git
{
    /// <summary>
    /// Keys for use with the <see cref="T:Wyam.SlightBlog.Git.GitCommits" /> and <see cref="T:Wyam.SlightBlog.Git.GitContributors" /> modules.
    /// </summary>
    public static class GitKeys
    {
        /// <summary>The SHA of the commit.</summary>
        /// <type><see cref="T:System.String" /></type>
        public const string Sha = "Sha";

        /// <summary>The SHA of every parent commit.</summary>
        /// <type><c>IReadOnlyList&lt;string&gt;</c></type>
        public const string Parents = "Parents";

        /// <summary>The name of the author.</summary>
        /// <type><see cref="T:System.String" /></type>
        public const string AuthorName = "AuthorName";

        /// <summary>The email of the author.</summary>
        /// <type><see cref="T:System.String" /></type>
        public const string AuthorEmail = "AuthorEmail";

        /// <summary>The date of the author signature.</summary>
        /// <type><see cref="T:System.DateTimeOffset" /></type>
        public const string AuthorWhen = "AuthorWhen";

        /// <summary>The name of the committer.</summary>
        /// <type><see cref="T:System.String" /></type>
        public const string CommitterName = "CommitterName";

        /// <summary>The email of the committer.</summary>
        /// <type><see cref="T:System.String" /></type>
        public const string CommitterEmail = "CommitterEmail";

        /// <summary>The date of the committer signature.</summary>
        /// <type><see cref="T:System.DateTimeOffset" /></type>
        public const string CommitterWhen = "CommitterWhen";

        /// <summary>The commit message.</summary>
        /// <type><see cref="T:System.String" /></type>
        public const string Message = "Message";

        /// <summary>
        /// All commit entries. The key is the path of the file and the value is the status of the file within the commit.
        /// </summary>
        /// <type><c>IReadOnlyDictionary&lt;string,string&gt;</c></type>
        public const string Entries = "Entries";

        /// <summary>
        /// The sequence of commits for the input document if <c>ForEachInputDocument()</c> was called (and an alternate
        /// metadata key was not provided).
        /// </summary>
        /// <type><c>IReadOnlyList&lt;IDocument&gt;</c></type>
        public const string Commits = "Commits";

        /// <summary>The name of the contributor.</summary>
        /// <type><see cref="T:System.String" /></type>
        public const string ContributorName = "ContributorName";

        /// <summary>The email of the contributor.</summary>
        /// <type><see cref="T:System.String" /></type>
        public const string ContributorEmail = "ContributorEmail";

        /// <summary>
        /// A document representing each commit by this contributor that contains the metadata specified in <see cref="T:Wyam.SlightBlog.Git.GitCommits" />.
        /// </summary>
        /// <type><c>IReadOnlyList&lt;IDocument&gt;</c></type>
        public const string Contributors = "Contributors";
    }
}