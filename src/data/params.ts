/** All browser simulation parameters. Unverified values are explicitly illustrative. */
export const params={
 dt:.1, horizon:2, samples:50, nss:20, rolloutDt:.1,
 vehicle:{length:4.5,width:1.8,wheelbase:2.7,maxSteer:.6,maxAcceleration:3,maxBrake:6},
 decoder:{baseScale:2,speedScale:4,endpointOffset:1.1,maxTargetHalf:10},
 // Appendix A s_i is not defined in the supplied excerpt: assume s_i = i*s.
 // Controller structure follows the prompt, but Eq. 41–45 constants await the PDF.
 controller:{lookaheadBase:2,lookaheadSpeed:.25,headingGain:.3,crossTrackGain:.4,kp:1.5,ki:.08,kd:.12,integralLimit:10},
 // These are DEMO defaults, NOT Tables VI/VII values. Never label as paper values.
 reward:{align:1,eff:.2,prog:.5,col:-10,off:-5,control:-.2,goal:5},
 corruption:{miss:.10,phantom:.05,dmin:5,dmax:50,maxSpeed:15,
 // Nominal sigmas for Eq. 53–54 unavailable: illustrative values only.
 positionSigma:.5,headingSigma:.08,speedSigma:.5,roadSigma:.3},
 scene:{roadHalfWidth:7,obstacle:{x:18,y:0,heading:0,length:4.5,width:1.8},goalX:42,egoSpeed:8,intersectionX:26},
 presets:{straight:[0,.8,0,0,0,-.2,.8,0,0,0,-.2],left:[0,.8,.45,.2,.5,-.2,.8,.6,.2,.5,-.2],right:[0,.7,-.6,0,-.7,-.4,.6,-.8,0,-.5,-.4],stop:[-.5,.25,0,-.7,0,-1,.25,0,-.7,0,-1]},
 playback:{stepSeconds:.65,maxFrameDt:.05,showcaseAgents:8,mobileAgents:5},
 rollout:{frames:100,agents:3},
 featureFlags:{attention:false},
 paperVerified:false
};
export type RewardCoefficients=typeof params.reward;
