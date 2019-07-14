// Decompiled with JetBrains decompiler
// Type: Wyam.Git.GitModule
// Assembly: Wyam.Git, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 28CB8FE7-54F8-43EA-A60F-3B31EA2C7128
// Assembly location: C:\Users\mlopez\Downloads\wyam.git.1.0.0\lib\net462\Wyam.Git.dll

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using LibGit2Sharp;
using Wyam.Common.Documents;
using Wyam.Common.Execution;
using Wyam.Common.IO;
using Wyam.Common.Meta;
using Wyam.Common.Modules;

namespace Wyam.SlightBlog.Git
{
    public abstract class GitModule : IModule
    {
        private DirectoryPath _repositoryPath;

        protected GitModule()
        {
        }

        protected GitModule(DirectoryPath repositoryPath)
        {
            if (repositoryPath != null && !repositoryPath.IsAbsolute)
                throw new ArgumentException("The repository location must be absolute", nameof(repositoryPath));

            SetupNativePaths.SetupGit();

            _repositoryPath = repositoryPath;
        }

        protected DirectoryPath GetRepositoryPath(IExecutionContext context)
        {
            var directoryPathList = new List<DirectoryPath>();
            if (_repositoryPath != null)
            {
                directoryPathList.Add(_repositoryPath);
            }
            else
            {
                directoryPathList.AddRange(context.FileSystem.InputPaths.Reverse().Select(x => context.FileSystem.RootPath.Combine(x)));
                directoryPathList.Add(context.FileSystem.RootPath);
            }

            using (var enumerator = directoryPathList.GetEnumerator())
            {
                while (enumerator.MoveNext())
                {
                    var directoryPath = enumerator.Current;
                    while (directoryPath != null && !Repository.IsValid(directoryPath.FullPath))
                        directoryPath = directoryPath.Parent;
                    if (directoryPath != null)
                    {
                        _repositoryPath = directoryPath;
                        return directoryPath;
                    }
                }
            }

            throw new InvalidOperationException("No repository could be found");
        }

        protected ImmutableArray<IDocument> GetCommitDocuments(
            IReadOnlyList<IDocument> inputs,
            IExecutionContext context)
        {
            using (var repository = new Repository(GetRepositoryPath(context).FullPath))
                return repository.Commits.OrderByDescending(x => x.Author.When).Select(x =>
                {
                    var iexecutionContext = context;
                    var metadataItems = new MetadataItems();
                    metadataItems.Add(new MetadataItem("Sha", x.Sha));
                    metadataItems.Add(new MetadataItem("Parents", x.Parents.Select(y => y.Sha).ToImmutableArray()));
                    metadataItems.Add(new MetadataItem("AuthorName", x.Author.Name));
                    metadataItems.Add(new MetadataItem("AuthorEmail", x.Author.Email));
                    metadataItems.Add(new MetadataItem("AuthorWhen", x.Author.When));
                    metadataItems.Add(new MetadataItem("CommitterName", x.Committer.Name));
                    metadataItems.Add(new MetadataItem("CommitterEmail", x.Committer.Email));
                    metadataItems.Add(new MetadataItem("CommitterWhen", x.Committer.When));
                    metadataItems.Add(new MetadataItem("Message", x.Message));
                    metadataItems.Add(new MetadataItem("Entries",
                        CompareTrees(repository, x).ToImmutableDictionary(y => new FilePath(y.Path), y => y.Status.ToString())));
                    return iexecutionContext.GetDocument(metadataItems);
                }).ToImmutableArray();
        }

        private static IEnumerable<Entry> CompareTrees(
            Repository repo,
            Commit toCheck)
        {
            var commitTree = toCheck.Tree;
            var parentCommitTrees = toCheck.Parents.Select(x => x.Tree).ToList();
            var patch = parentCommitTrees.Select(x => repo.Diff.Compare<Patch>(x, commitTree)).SelectMany(x => (IEnumerable<PatchEntryChanges>) x);
            if (!parentCommitTrees.Any())
            {
                foreach (var str in TraverseTree(commitTree))
                    yield return new Entry
                    {
                        Path = str,
                        Status = ChangeKind.Added
                    };
            }
            else if (!parentCommitTrees.Skip(1).Any())
            {
                foreach (var patchEntryChanges in patch)
                    yield return new Entry
                    {
                        Path = patchEntryChanges.Path,
                        Status = patchEntryChanges.Status
                    };
            }
        }

        private static IEnumerable<string> TraverseTree(Tree tree)
        {
            foreach (var treeEntry in tree.ToList())
            {
                var item = treeEntry;
                if (item.TargetType == TreeEntryTargetType.Blob)
                {
                    yield return item.Path;
                }

                if (item.TargetType == TreeEntryTargetType.Tree)
                {
                    foreach (var str in TraverseTree((Tree) item.Target))
                        yield return str;
                }
            }
        }

        /// <inheritdoc />
        public abstract IEnumerable<IDocument> Execute(
            IReadOnlyList<IDocument> inputs,
            IExecutionContext context);

        private class Entry
        {
            public string Path { get; set; }

            public ChangeKind Status { get; set; }
        }
    }
}