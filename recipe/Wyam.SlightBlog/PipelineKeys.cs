namespace Wyam.SlightBlog
{
    public static class PipelineKeys
    {
        /// <summary>
        /// Loads page content from Markdown and/or Razor files.
        /// </summary>
        public const string Pages = nameof(Pages);

        /// <summary>
        /// Loads blog posts from Markdown and/or Razor files.
        /// </summary>
        public const string Posts = nameof(Posts);

        /// <summary>
        /// Renders blog post pages. This needs to come after the tags
        /// pipeline so that the listing of tags on each blog post page
        /// will have the correct counts.
        /// </summary>
        public const string RenderPosts = nameof(RenderPosts);

        /// <summary>
        /// Renders and outputs the content pages using the template layouts.
        /// </summary>
        public const string RenderPages = nameof(RenderPages);

        /// <summary>
        /// Generates any redirect placeholders and files.
        /// </summary>
        public const string Redirects = nameof(Redirects);

        /// <summary>
        /// Copies all other resources to the output path.
        /// </summary>
        public const string Resources = nameof(Resources);

        /// <summary>
        /// Validates links.
        /// </summary>
        public const string ValidateLinks = nameof(ValidateLinks);

        public const string Foundation = nameof(Foundation);

        public const string RenderFoundation = nameof(RenderFoundation);

        public const string PostContent = nameof(PostContent);
    }
}