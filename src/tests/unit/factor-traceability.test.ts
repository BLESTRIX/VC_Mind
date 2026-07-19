import {describe,expect,it} from 'vitest';
import {applyMissingDataPenalty,completeAssessments,dimensionScore,factorPoints,FACTOR_LEVEL_RATIO} from '../../server/scoring/factor-scoring.js';
import {RECOMMENDATION_POLICY,RECOMMENDATION_WARNING} from '../../server/scoring/scoring.config.js';

describe('factor scoring traceability',()=>{
 it('maps qualitative levels to points deterministically',()=>{expect(FACTOR_LEVEL_RATIO).toEqual({none:0,weak:.25,moderate:.5,strong:.75,exceptional:1});expect(factorPoints(2,{level:'strong',missingData:false})).toBe(1.5);});
 it('derives a dimension from factor points and clamps it',()=>expect(dimensionScore([{score:1.5,maximumScore:2},{score:2,maximumScore:2}])).toBe(8.75));
 it('makes missing data lower before applying the exact level ratio',()=>{const penalized=applyMissingDataPenalty({factorKey:'x',level:'strong',explanation:'x',supportingClaimIds:[],supportingEvidenceIds:[],missingData:true});expect(penalized.level).toBe('moderate');expect(factorPoints(2,penalized)).toBe(1);});
 it('fills omitted rubric factors with an explicit zero and missing status',()=>{const factors=completeAssessments('founder',[]);expect(factors).toHaveLength(5);expect(factors.every(item=>item.level==='none'&&item.missingData)).toBe(true);});
 it('centralizes an explicitly uncalibrated recommendation policy',()=>{expect(RECOMMENDATION_POLICY).toMatchObject({version:'mvp-v1',calibrated:false,investThreshold:7.5,passThreshold:5.5});expect(RECOMMENDATION_WARNING).toContain('not yet been calibrated');});
});
