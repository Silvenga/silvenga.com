// Decompiled with JetBrains decompiler
// Type: Wyam.Git.GitCommits
// Assembly: Wyam.Git, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 28CB8FE7-54F8-43EA-A60F-3B31EA2C7128
// Assembly location: C:\Users\mlopez\Downloads\wyam.git.1.0.0\lib\net462\Wyam.Git.dll

using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using Wyam.Common.Documents;
using Wyam.Common.Execution;
using Wyam.Common.IO;
using Wyam.Common.Meta;

namespace Wyam.SlightBlog.Git
{
    /// <summary>
    /// Outputs documents and metadata for commits in a Git repository.
    /// </summary>
    /// <remarks>
    /// <para>
    /// This module works in one of two ways. By default, a new document is output for each commit in the
    /// repository. These output documents have the metadata documented below to describe each commit. In
    /// this mode, all input documents are forgotten and only documents for each commit are output.
    /// </para>
    /// <para>
    /// Alternatively, by calling <c>ForEachInputDocument()</c>, commit data is added to every input document
    /// for which the repository contains an entry. The data is added as an <c>IDocument</c> sequence to the
    /// specified metadata key in the input document and each document in the sequence contains the same
    /// metadata that would have been added in the default mode. All input documents are output from this module
    /// (including those that didn't have commit information).
    /// </para>
    /// </remarks>
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.Sha" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.Parents" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.AuthorName" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.AuthorEmail" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.AuthorWhen" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.CommitterName" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.CommitterEmail" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.CommitterWhen" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.Message" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.Entries" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.Commits" usage="Output" />
    /// <category>Metadata</category>
    public class GitCommits : GitModule
    {
        private string _commitsMetadataKey;

        /// <summary>
        /// Gets commits from the repository the <c>InputFolder</c> is a part of.
        /// </summary>
        public GitCommits()
        {
        }

        /// <summary>
        /// Gets commits from the repository the specified path is a part of.
        /// </summary>
        /// <param name="repositoryPath">The repository path.</param>
        public GitCommits(DirectoryPath repositoryPath)
            : base(repositoryPath)
        {
        }

        /// <summary>
        /// Specifies that commit information should be added to each input document.
        /// </summary>
        /// <param name="commitsMetadataKey">The metadata key to set for commit information.</param>
        /// <returns>The current module instance.</returns>
        public GitCommits ForEachInputDocument(string commitsMetadataKey = "Commits")
        {
            _commitsMetadataKey = commitsMetadataKey;
            return this;
        }

        /// <inheritdoc />
        public override IEnumerable<IDocument> Execute(
            IReadOnlyList<IDocument> inputs,
            IExecutionContext context)
        {
            var commitDocuments = GetCommitDocuments(inputs, context);
            if (string.IsNullOrEmpty(_commitsMetadataKey))
                return commitDocuments;
            var repositoryPath = GetRepositoryPath(context);
            return inputs.AsParallel().Select(context, input =>
            {
                if (input.Source == null)
                    return input;
                var relativePath = repositoryPath.GetRelativePath(input.Source);
                if (relativePath.Equals(input.Source))
                    return input;
                var immutableArray = commitDocuments.Where(x =>
                {
                    x.Get<IReadOnlyDictionary<FilePath, string>>("Entries");
                    return x.Get<IReadOnlyDictionary<FilePath, string>>("Entries").ContainsKey(relativePath);
                }).ToImmutableArray();
                var iexecutionContext = context;
                var idocument = input;
                var metadataItems = new MetadataItems();
                metadataItems.Add(new MetadataItem(_commitsMetadataKey, immutableArray));
                return iexecutionContext.GetDocument(idocument, metadataItems);
            });
        }
    }
}