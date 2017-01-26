using Wyam.Common.IO;

namespace Wyam.SlightBlog
{
    public static class MetaKeys
    {
        public const string PagesPath = nameof(PagesPath);

        // ***Global

        /// <summary>
        /// When used in global metadata, indicates the title of your blog. Otherwise,
        /// when used in document metadata, indicates the title of the post or page.
        /// </summary>
        /// <scope>Global</scope>
        /// <scope>Document</scope>
        /// <type><see cref="string"/></type>
        public const string Title = nameof(Title);

        /// <summary>
        /// Controls the parent path where blog posts are placed. The default is "posts".
        /// This affects both input and output files (I.e., if you change this your input
        /// files must also be under the same path).
        /// </summary>
        /// <scope>Global</scope>
        /// <type><see cref="DirectoryPath"/> or <see cref="string"/></type>
        public const string PostsPath = nameof(PostsPath);

        /// <summary>
        /// Set this to control the activated set of Markdown extensions for the
        /// Markdig Markdown renderer. The default value is "advanced+bootstrap".
        /// </summary>
        /// <scope>Global</scope>
        /// <type><see cref="string"/></type>
        public const string MarkdownExtensions = nameof(MarkdownExtensions);

        /// <summary>
        /// Set to <c>true</c> (the default value is <c>false</c>) to
        /// validate all absolute links. Note that this may add considerable
        /// time to your generation process.
        /// </summary>
        /// <scope>Global</scope>
        /// <type><see cref="bool"/></type>
        public const string ValidateAbsoluteLinks = nameof(ValidateAbsoluteLinks);

        /// <summary>
        /// Set to <c>true</c> (the default value) to
        /// validate all relative links.
        /// </summary>
        /// <scope>Global</scope>
        /// <type><see cref="bool"/></type>
        public const string ValidateRelativeLinks = nameof(ValidateRelativeLinks);

        /// <summary>
        /// Set to <c>true</c> (the default value is <c>false</c>) to
        /// report errors on link validation failures.
        /// </summary>
        /// <scope>Global</scope>
        /// <type><see cref="bool"/></type>
        public const string ValidateLinksAsError = nameof(ValidateLinksAsError);
    }
}