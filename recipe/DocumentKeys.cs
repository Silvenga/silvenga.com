using System;

namespace Wyam.SlightBlog
{
    public class DocumentKeys
    {
        /// <summary>
        /// The date of the post.
        /// </summary>
        /// <scope>Document</scope>
        /// <type><see cref="DateTime"/> or <see cref="string"/></type>
        public const string Published = nameof(Published);

        public const string Slug = nameof(Slug);
    }
}