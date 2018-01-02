using System.Collections.Generic;
using System.IO;
using System.Linq;
using Markdig;
using Markdig.Renderers;
using Markdig.Renderers.Html;
using Markdig.Syntax;
using Markdig.Syntax.Inlines;

namespace recipe.MarkdigExtensions.ImagePlaceholders
{
    public class ImagePlaceholdersExtension : IMarkdownExtension
    {
        public static readonly ICollection<string> BaseContentPaths = new List<string>();

        public void Setup(MarkdownPipelineBuilder pipeline)
        {
            pipeline.DocumentProcessed -= PipelineOnDocumentProcessed;
            pipeline.DocumentProcessed += PipelineOnDocumentProcessed;
        }

        public void Setup(MarkdownPipeline pipeline, IMarkdownRenderer renderer)
        {
        }

        private static void PipelineOnDocumentProcessed(MarkdownDocument document)
        {
            foreach (var node in document.Descendants())
            {
                if (node is Inline)
                {
                    var link = node as LinkInline;
                    if (link != null && link.IsImage)
                    {
                        var resolvedImages = ResolveFirstImage(link.Url).ToList();
                        if (resolvedImages.Count == 1)
                        {
                            var image = resolvedImages.Single();
                            link.GetAttributes().AddProperty("data-real-path", image.RealPath);
                            link.GetAttributes().AddProperty("height", image.Height.ToString());
                            link.GetAttributes().AddProperty("width", image.Width.ToString());
                        }
                    }
                }
            }
        }

        public static IEnumerable<(string RealPath, int Height, int Width)> ResolveFirstImage(string relativePath)
        {
            var resolvedPaths = BaseContentPaths
                .Select(x =>
                    {
                        if (relativePath.StartsWith("/"))
                        {
                            relativePath = relativePath.Substring(1);
                        }
                        return Path.Combine(x, relativePath);
                    })
                .Select(x => Path.GetFullPath(x))
                .Where(x => File.Exists(x))
                .Select(x =>
                {
                    using (var image = SixLabors.ImageSharp.Image.Load(x))
                    {
                        return (x, image.Height, image.Width);
                    }
                });
            return resolvedPaths;
        }
    }
}