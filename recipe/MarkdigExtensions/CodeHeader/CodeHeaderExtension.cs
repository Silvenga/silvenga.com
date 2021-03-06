using Markdig;
using Markdig.Renderers;
using Markdig.Renderers.Html;

namespace Wyam.SlightBlog.MarkdigExtensions.CodeHeader
{
    public class CodeHeaderExtension : IMarkdownExtension
    {
        public void Setup(MarkdownPipelineBuilder pipeline)
        {
        }

        public void Setup(MarkdownPipeline pipeline, IMarkdownRenderer renderer)
        {
            if (renderer is HtmlRenderer htmlRenderer)
            {
                if (!htmlRenderer.ObjectRenderers.Contains<CodeHeaderRenderer>())
                {
                    htmlRenderer.ObjectRenderers.Replace<CodeBlockRenderer>(new CodeHeaderRenderer());
                }
            }
        }
    }
}