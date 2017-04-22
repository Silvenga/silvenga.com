using System;
using System.Collections.Generic;
using System.Linq;

using Wyam.Common.Configuration;
using Wyam.Common.Documents;
using Wyam.Common.Execution;
using Wyam.Common.IO;
using Wyam.Common.Meta;
using Wyam.Common.Modules;
using Wyam.Common.Modules.Contents;
using Wyam.Core.Modules.Contents;
using Wyam.Core.Modules.Control;
using Wyam.Core.Modules.Extensibility;
using Wyam.Core.Modules.IO;
using Wyam.Core.Modules.Metadata;
using Wyam.Git;
using Wyam.Html;
using Wyam.Minification;

namespace Wyam.SlightBlog
{
    public class SlightBlog : IRecipe
    {
        public void Apply(IEngine engine)
        {
            // Global metadata defaults
            engine.Settings[MetaKeys.Title] = "My Blog";
            engine.Settings[MetaKeys.MarkdownExtensions] = "advanced+bootstrap";
            engine.Settings[MetaKeys.PostsPath] = new DirectoryPath("posts");
            engine.Settings[MetaKeys.PagesPath] = new DirectoryPath("pages");
            engine.Settings[MetaKeys.ThemePath] = new DirectoryPath("theme");
            engine.Settings[MetaKeys.GithubBasePath] = "https://github.com/Silvenga/silvenga.com"; // No slash

            engine.Pipelines.Add(PipelineKeys.Posts,
                new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.PostsPath).FullPath}/*.md"),
                new GitMeta(),
                new FrontMatter(new Yaml.Yaml()),
                new Execute(ctx => new Markdown.Markdown().UseConfiguration(ctx.String(MetaKeys.MarkdownExtensions))),
                new Where((doc, ctx) =>
                {
                    if (!doc.ContainsKey(DocumentKeys.Published) || doc.Get(DocumentKeys.Published) == null)
                    {
                        Common.Tracing.Trace.Warning($"Skipping {doc.Source} due to not having {DocumentKeys.Published} metadata");
                        return false;
                    }
                    if (doc.Get<DateTime>(DocumentKeys.Published) > DateTime.Now)
                    {
                        Common.Tracing.Trace.Warning(
                            $"Skipping {doc.Source} due to having {DocumentKeys.Published} metadata of {doc.Get<DateTime>(DocumentKeys.Published)} in the future (current date and time is {DateTime.Now})");
                        return false;
                    }
                    return true;
                })
            );

            engine.Pipelines.Add(PipelineKeys.Pages,
                new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.PagesPath).FullPath}/*.md"),
                new GitMeta(),
                new FrontMatter(new Yaml.Yaml()),
                new Execute(ctx => new Markdown.Markdown().UseConfiguration(ctx.String(MetaKeys.MarkdownExtensions))),
                new Concat(
                    new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.PagesPath).FullPath}/*.cshtml"),
                    new FrontMatter(new Yaml.Yaml())
                ),
                OrderByPublishDate()
            );

            engine.Pipelines.Add(PipelineKeys.Foundation,
                new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.ThemePath).FullPath}/**/{{*.cshtml,!_*}}"),
                new FrontMatter(new Yaml.Yaml()),
                OrderByPublishDate()
            );

            engine.Pipelines.Add(PipelineKeys.RenderPosts,
                new Documents(PipelineKeys.Posts),
                new Razor.Razor()
                    .WithLayout((doc, ctx) => $"/{ctx.DirectoryPath(MetaKeys.ThemePath).FullPath}/_PostLayout.cshtml"),
                new Meta(Keys.RelativeFilePath, (doc, ctx) =>
                {
                    var slug = doc.Get(DocumentKeys.Slug, doc.FilePath(Keys.SourceFileName).FileNameWithoutExtension.FullPath);
                    return slug;
                }),
                new Meta(Keys.RelativeFilePath, AppendSlash),
                OrderByPublishDate()
            );

            engine.Pipelines.Add(PipelineKeys.RenderPages,
                new Documents(PipelineKeys.Pages),
                new Razor.Razor()
                    .WithLayout((doc, ctx) => $"/{ctx.DirectoryPath(MetaKeys.ThemePath).FullPath}/_PageLayout.cshtml"),
                new Meta(Keys.RelativeFilePath, (doc, ctx) =>
                {
                    var slug = doc.Get(DocumentKeys.Slug, doc.FilePath(Keys.SourceFileName).FileNameWithoutExtension.FullPath);
                    return slug;
                }),
                new Meta(Keys.RelativeFilePath, AppendSlash),
                OrderByPublishDate()
            );

            engine.Pipelines.Add(PipelineKeys.RenderFoundation,
                new Documents(PipelineKeys.Foundation),
                new Razor.Razor(),
                new Meta(Keys.RelativeFilePath, (doc, ctx) => SemiFlatten(doc, ctx, MetaKeys.ThemePath)),
                OrderByPublishDate()
            );

            engine.Pipelines.Add(PipelineKeys.WriteContent,
                new Documents(PipelineKeys.RenderPosts),
                new Concat(new Documents(PipelineKeys.RenderPages)),
                new Concat(new Documents(PipelineKeys.RenderFoundation)),
                new MinifyHtml().RemoveOptionalEndTags(false),
                new WriteFiles(".html")
            );

            engine.Pipelines.Add(PipelineKeys.FoundationContent,
                new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.ThemePath).FullPath}/{{**,!js,!less,!css}}/*{{!.cshtml,!.md,}}"),
                new Meta(Keys.RelativeFilePath, (doc, ctx) => SemiFlatten(doc, ctx, MetaKeys.ThemePath)),
                new WriteFiles()
            );

            engine.Pipelines.Add(PipelineKeys.PostContent,
                new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.PostsPath).FullPath}/**/*{{!.cshtml,!.md,}}"),
                new Meta(Keys.RelativeFilePath, (doc, ctx) => SemiFlatten(doc, ctx, MetaKeys.PostsPath)),
                new WriteFiles()
            );

            engine.Pipelines.Add("PageContent",
                new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.PagesPath).FullPath}/**/*{{!.cshtml,!.md,}}"),
                new Meta(Keys.RelativeFilePath, (doc, ctx) => SemiFlatten(doc, ctx, MetaKeys.PagesPath)),
                new WriteFiles()
            );

            engine.Pipelines.Add(PipelineKeys.RenderJs,
                new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.ThemePath).FullPath}/js/*.js"),
                new OrderBy((doc, ctx) => doc.FilePath(Keys.SourceFileName)),
                new Combine(),
                new MinifyJs(),
                new WriteFiles((doc, ctx) => "min.js")
            );

            engine.Pipelines.Add(PipelineKeys.RenderCss,
                new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.ThemePath).FullPath}/less/*.less"),
                new Less.Less(),
                new Concat(new ReadFiles(ctx => $"{ctx.DirectoryPath(MetaKeys.ThemePath).FullPath}/css/*.css")),
                new OrderBy((doc, ctx) => doc.FilePath(Keys.SourceFileName)),
                new Combine(),
                new MinifyCss(),
                new WriteFiles((doc, ctx) => "min.css")
            );

            engine.Pipelines.Add("Sitemap",
                new Documents(PipelineKeys.WriteContent),
                new Meta("SitemapItem", (doc, ctx) =>
                {
                    var link = ctx.GetLink(doc, true);
                    if (ctx.GetLink(doc).EndsWith("/"))
                    {
                        link = link.Substring(0, link.Length - 1);
                    }
                    else
                    {
                        link += "/";
                    }
                    return new SitemapItem(link);
                }),
                new Sitemap(),
                new WriteFiles((doc, ctx) => "sitemap.xml")
            );

            engine.Pipelines.Add(PipelineKeys.ValidateLinks,
                new If(ctx => ctx.Get<bool>(MetaKeys.ValidateAbsoluteLinks) || ctx.Get<bool>(MetaKeys.ValidateRelativeLinks),
                    new Documents(PipelineKeys.RenderPages),
                    new Concat(
                        new Documents(PipelineKeys.RenderPosts)
                    ),
                    new Concat(
                        new Documents(PipelineKeys.FoundationContent)
                    ),
                    new Where((doc, ctx) =>
                    {
                        var destinationPath = doc.FilePath(Keys.DestinationFilePath);
                        return destinationPath != null
                               && (destinationPath.Extension == ".html" || destinationPath.Extension == ".htm");
                    }),
                    new Execute(ctx =>
                        new ValidateLinks()
                            .ValidateAbsoluteLinks(ctx.Get<bool>(MetaKeys.ValidateAbsoluteLinks))
                            .ValidateRelativeLinks(ctx.Get<bool>(MetaKeys.ValidateRelativeLinks))
                            .AsError(ctx.Get<bool>(MetaKeys.ValidateLinksAsError)
                            )
                    )
                )
            );
        }

        private object SemiFlatten(IDocument doc, IExecutionContext ctx, string directoryPathKey)
        {
            var themePath = ctx.DirectoryPath(directoryPathKey).FullPath;
            var semiFlattened = doc.FilePath(Keys.RelativeFilePath).FullPath.Substring(themePath.Length + 1);
            return semiFlattened;
        }

        private object AppendSlash(IDocument doc, IExecutionContext ctx)
        {
            var baseDirectory = doc.FilePath(Keys.RelativeFilePath)?.Directory.FullPath;
            var slashed = doc.FilePath(Keys.RelativeFilePath)?.FileNameWithoutExtension.FullPath;
            return $"{baseDirectory}/{slashed}/index.html";
        }

        private IModule OrderByPublishDate()
        {
            return new OrderBy((doc, ctx) => doc.Get<DateTime>(DocumentKeys.Published))
                .Descending()
                .ThenBy((doc, ctx) => doc.FilePath(Keys.SourceFileName));
        }

        public void Scaffold(IFile configFile, IDirectory inputDirectory)
        {
            // Add info page
            inputDirectory.GetFile("about.md")
                          .WriteAllText(
                              @"Title: About Me
---
I'm awesome!");

            // Add post page
            inputDirectory.GetFile("posts/first-post.md")
                          .WriteAllText(
                              @"Title: First Post
Published: 1/1/2016
Tags: Introduction
---
This is my first post!");
        }
    }

    public class GitMeta : IModule
    {
        public IEnumerable<IDocument> Execute(IReadOnlyList<IDocument> inputs, IExecutionContext context)
        {
            var output = new GitCommits().ForEachInputDocument().Execute(inputs, context);
            return output.AsParallel()
                         .Select(x =>
                         {
                             var commits = x.Get<IReadOnlyList<IDocument>>("Commits")
                                            .Select(c => new
                                            {
                                                Date = c.Get<DateTimeOffset>("AuthorWhen"),
                                                Author = c.String("AuthorName"),
                                                Email = c.String("AuthorEmail"),
                                                Sha = c.String("Sha")?.Substring(0, 8)
                                            })
                                            .ToList();

                             var numberOfChanges = commits.Count;
                             var lastCommit = commits.FirstOrDefault();
                             var firstCommit = commits.LastOrDefault();

                             var relativePathSegments = x.Source.Segments.Reverse()
                                                         .Take(x.Source.Segments.Length - context.FileSystem.RootPath.Segments.Length)
                                                         .Reverse();
                             var githubFileUrl = context.String(MetaKeys.GithubBasePath) + "/tree/master/" + string.Join(" / ", relativePathSegments);
                             var githubCommitUrl = context.String(MetaKeys.GithubBasePath) + "/commit/" + lastCommit?.Sha;

                             var metaData = new Dictionary<string, object>
                             {
                                 {"Changes", numberOfChanges},
                                 {"LastChange", lastCommit?.Date},
                                 {"FirstChange", firstCommit?.Date},
                                 {"LastSha", lastCommit?.Sha},
                                 {"LastCommitLink", githubCommitUrl},
                                 {"FirstSha", firstCommit?.Sha},
                                 {"GithubUrl", githubFileUrl},
                                 {DocumentKeys.Published, firstCommit?.Date.DateTime}
                             };

                             return context.GetDocument(x, metaData.ToList());
                         });
        }
    }
}