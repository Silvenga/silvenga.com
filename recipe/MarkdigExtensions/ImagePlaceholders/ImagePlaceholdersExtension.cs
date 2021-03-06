using System.Collections.Generic;
using Markdig;
using Markdig.Renderers;
using Markdig.Renderers.Html.Inlines;

namespace Wyam.SlightBlog.MarkdigExtensions.ImagePlaceholders
{
    public class ImagePlaceholdersExtension : IMarkdownExtension
    {
        public static readonly ICollection<string> BaseContentPaths = new List<string>();

        public void Setup(MarkdownPipelineBuilder pipeline)
        {
        }

        public void Setup(MarkdownPipeline pipeline, IMarkdownRenderer renderer)
        {
            if (renderer is HtmlRenderer htmlRenderer)
            {
                if (!htmlRenderer.ObjectRenderers.Contains<ImagePlaceholdersRenderer>())
                {
                    htmlRenderer.ObjectRenderers
                                .Replace<LinkInlineRenderer>(new ImagePlaceholdersRenderer(BaseContentPaths));
                }
            }
        }
    }
}