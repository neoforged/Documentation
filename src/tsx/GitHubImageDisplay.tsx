import React from "react";

export default function GitHubImageDisplay({repository, branch, path, clazz, alt, caption = alt, width}: {repository: string, branch: string, path: string, clazz: string, alt: string, caption: string, width: number}) {
    return (
        <figure class="display-image" style={{width: `${width}px`}}>
            <img src={`https://raw.githubusercontent.com/${repository}/refs/heads/${branch}/${path}`} decoding="async" loading="lazy" className={clazz} alt={alt}/>
            <figcaption>{caption}</figcaption>
        </figure>
    );
}
