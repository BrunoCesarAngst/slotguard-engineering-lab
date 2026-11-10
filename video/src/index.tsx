import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FullVideo, stages} from './Completos';

const Root = () => <>{stages.map(stage => <React.Fragment key={stage.stage}>
  <Composition id={`Etapa${stage.stage}Vertical`} component={FullVideo}
    defaultProps={{stage: stage.stage}} durationInFrames={stage.durationInFrames}
    fps={30} width={1080} height={1920}/>
  <Composition id={`Etapa${stage.stage}Horizontal`} component={FullVideo}
    defaultProps={{stage: stage.stage}} durationInFrames={stage.durationInFrames}
    fps={30} width={1920} height={1080}/>
</React.Fragment>)}</>;
registerRoot(Root);
