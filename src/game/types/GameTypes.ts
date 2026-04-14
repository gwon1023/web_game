export type SceneKey = 'TitleScene' | 'PlayScene' | 'ResultScene';

export type InputAction = 'lightAttack' | 'heavyAttack' | 'finisher';

export interface ResultSceneData {
  readonly message: string;
}
