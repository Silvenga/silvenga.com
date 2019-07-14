// Decompiled with JetBrains decompiler
// Type: Wyam.Git.GitContributors
// Assembly: Wyam.Git, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 28CB8FE7-54F8-43EA-A60F-3B31EA2C7128
// Assembly location: C:\Users\mlopez\Downloads\wyam.git.1.0.0\lib\net462\Wyam.Git.dll

using System;
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
    /// Outputs documents and metadata for contributors in a Git repository.
    /// </summary>
    /// <remarks>
    /// <para>
    /// This module works in one of two ways. By default, a new document is output for each contributor in the
    /// repository. These output documents have the metadata documented below to describe each contributor. In
    /// this mode, all input documents are forgotten and only documents for each contributor are output.
    /// </para>
    /// <para>
    /// Alternatively, by calling <c>ForEachInputDocument()</c>, contributor data is added to every input document
    /// for which the repository contains an entry. The data is added as an <c>IDocument</c> sequence to the
    /// specified metadata key in the input document and each document in the sequence contains the same
    /// metadata that would have been added in the default mode. All input documents are output from this module
    /// (including those that didn't have commit information).
    /// </para>
    /// </remarks>
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.ContributorName" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.ContributorEmail" usage="Output" />
    /// <metadata cref="F:Wyam.SlightBlog.Git.GitKeys.Commits" usage="Output" />
    /// <category>Metadata</category>
    public class GitContributors : GitModule
    {
        private bool _authors = true;
        private bool _committers = true;
        private string _contributorsMetadataKey;

        /// <summary>
        /// Gets authors from the repository the <c>InputFolder</c> is a part of.
        /// </summary>
        public GitContributors()
        {
        }

        /// <summary>
        /// Gets authors from the repository the specified path is a part of.
        /// </summary>
        /// <param name="repositoryPath">The repository path.</param>
        public GitContributors(DirectoryPath repositoryPath)
            : base(repositoryPath)
        {
        }

        /// <summary>Specifies that authors should be included.</summary>
        /// <param name="authors">If set to <c>true</c> (the default), authors are included in the output.</param>
        /// <returns>The current module instance.</returns>
        public GitContributors WithAuthors(bool authors = true)
        {
            _authors = authors;
            return this;
        }

        /// <summary>Specifies that committers should be included.</summary>
        /// <param name="committers">If set to <c>true</c> (the default), committers are included in the output.</param>
        /// <returns>The current module instance.</returns>
        public GitContributors WithCommitters(bool committers = true)
        {
            _committers = committers;
            return this;
        }

        /// <summary>
        /// Specifies that contributor information should be added to each input document.
        /// </summary>
        /// <param name="contributorsMetadataKey">The metadata key to set for contributor information.</param>
        /// <returns>The current module instance.</returns>
        public GitContributors ForEachInputDocument(string contributorsMetadataKey = "Contributors")
        {
            _contributorsMetadataKey = contributorsMetadataKey;
            return this;
        }

        /// <inheritdoc />
        public override IEnumerable<IDocument> Execute(
            IReadOnlyList<IDocument> inputs,
            IExecutionContext context)
        {
            var commitDocuments = GetCommitDocuments(inputs, context);
            var dictionary = new Dictionary<string, Tuple<string, List<IDocument>>>();
            foreach (var idocument in commitDocuments)
            {
                string key1 = null;
                if (_authors)
                {
                    key1 = idocument.String("AuthorEmail");
                    Tuple<string, List<IDocument>> tuple;
                    if (!dictionary.TryGetValue(key1, out tuple))
                    {
                        tuple = new Tuple<string, List<IDocument>>(idocument.String("AuthorName"), new List<IDocument>());
                        dictionary[key1] = tuple;
                    }

                    tuple.Item2.Add(idocument);
                }

                if (_committers)
                {
                    var key2 = idocument.String("CommitterEmail");
                    if (key2 != key1)
                    {
                        Tuple<string, List<IDocument>> tuple;
                        if (!dictionary.TryGetValue(key2, out tuple))
                        {
                            tuple = new Tuple<string, List<IDocument>>(idocument.String("CommitterName"), new List<IDocument>());
                            dictionary[key2] = tuple;
                        }

                        tuple.Item2.Add(idocument);
                    }
                }
            }

            var contributorDocuments = dictionary.Select(x =>
            {
                var iexecutionContext = context;
                var metadataItems = new MetadataItems();
                metadataItems.Add(new MetadataItem("ContributorEmail", x.Key));
                metadataItems.Add(new MetadataItem("ContributorName", x.Value.Item1));
                metadataItems.Add(new MetadataItem("Commits", x.Value.Item2.ToImmutableArray()));
                return iexecutionContext.GetDocument(metadataItems);
            }).ToImmutableArray();
            if (string.IsNullOrEmpty(_contributorsMetadataKey))
                return contributorDocuments;
            var repositoryPath = GetRepositoryPath(context);
            return inputs.AsParallel().Select(context, input =>
            {
                if (input.Source == null)
                    return input;
                FilePath relativePath = repositoryPath.GetRelativePath(input.Source);
                if (relativePath.Equals(input.Source))
                    return input;
                var immutableArray = contributorDocuments.Select(x =>
                {
                    var iexecutionContext = context;
                    var metadataItems = new MetadataItems();
                    metadataItems.Add(new MetadataItem("ContributorEmail", x["ContributorEmail"]));
                    metadataItems.Add(new MetadataItem("ContributorName", x["ContributorName"]));
                    metadataItems.Add(new MetadataItem("Commits",
                        x.Get<IReadOnlyList<IDocument>>("Commits").Where(y => y.Get<IReadOnlyDictionary<FilePath, string>>("Entries").ContainsKey(relativePath))
                         .ToImmutableArray()));
                    return iexecutionContext.GetDocument(metadataItems);
                }).Where(x => x.Get<IReadOnlyList<IDocument>>("Commits").Count > 0).ToImmutableArray();
                var iexecutionContext1 = context;
                var idocument = input;
                var metadataItems1 = new MetadataItems();
                metadataItems1.Add(new MetadataItem(_contributorsMetadataKey, immutableArray));
                return iexecutionContext1.GetDocument(idocument, metadataItems1);
            });
        }
    }
}