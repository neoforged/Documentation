import React from "react";

export default function GitHubImageDisplay({repository, branch, path, clazz, caption, alt = caption, captionHint = path, width}: {repository: string, branch: string, path: string, clazz: string, caption: string, alt: string, captionHint: string, width: number}) {
    return (
        <figure class="display-image" style={{width: `${width}px`}}>
            <img src={`https://raw.githubusercontent.com/${repository}/refs/heads/${branch}/${path}`} decoding="async" loading="lazy" className={clazz} alt={alt}/>
            <figcaption><abbr title={captionHint}>{caption}</abbr></figcaption>
        </figure>
    );
}
