using System.Collections.Generic;
using System.IO;
using System.Linq;
using Markdig;
using Markdig.Renderers;
using Markdig.Renderers.Html;
using Markdig.Renderers.Html.Inlines;
using Markdig.Syntax.Inlines;

namespace recipe.MarkdigExtensions.ImagePlaceholders
{
    public class ImagePlaceholdersRenderer : LinkInlineRenderer
    {
        private const int MaxWidth = 780;

        private ICollection<string> _baseContentPaths;

        public ImagePlaceholdersRenderer(ICollection<string> baseContentPaths)
        {
            _baseContentPaths = baseContentPaths;
        }

        protected override void Write(HtmlRenderer renderer, LinkInline link)
        {
            if (link.IsImage)
            {
                var resolvedImages = ResolveImages(link.Url).ToList();
                if (resolvedImages.Count == 1)
                {
                    var image = resolvedImages.Single();

                    if (image.Width > MaxWidth || true)
                    {
                        var ratioPercent = image.Height / (decimal)image.Width * 100;

                        var outerContainer = new HtmlAttributes();
                        outerContainer.AddClass("img-container-outer");
                        outerContainer.AddProperty("data-real-path", image.RealPath);
                        outerContainer.AddProperty("data-real-width", image.Width.ToString());
                        outerContainer.AddProperty("data-real-height", image.Height.ToString());
                        outerContainer.AddProperty("style", $"max-width: {System.Math.Min(image.Width, MaxWidth)}px;");

                        renderer.Write("<div");
                        renderer.WriteAttributes(outerContainer);
                        renderer.Write(">");
                        {
                            var imgContainerAttributes = new HtmlAttributes();
                            imgContainerAttributes.AddClass("img-container");
                            imgContainerAttributes.AddProperty("style", $"padding-top: {ratioPercent}%");
                            renderer.Write("<div");
                            renderer.WriteAttributes(imgContainerAttributes);
                            renderer.Write(">");
                            {
                                renderer.Write("<p class=\"img-container-inner\">");
                                var imgAttributes = new HtmlAttributes();
                                imgAttributes.AddProperty("data-src", link.Url);
                                imgAttributes.AddClass("img-fluid");
                                link.SetAttributes(imgAttributes);
                                link.Url = null;
                                base.Write(renderer, link);
                                renderer.Write("</p>");
                            }
                            renderer.Write("</div>");
                        }
                        renderer.Write("</div>");

                        return;
                    }
                }
            }

            base.Write(renderer, link);
        }

        public IEnumerable<(string RealPath, int Height, int Width)> ResolveImages(string relativePath)
        {
            var resolvedPaths = _baseContentPaths
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