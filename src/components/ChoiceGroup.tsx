'use client';

/* 단일/다중 선택 알약 — 선택 = 검정 채움. 단일 선택은 같은 것을 다시 누르면 해제된다 (원본 동작). */
type Props =
  | { options: string[]; multi?: false; value: string; onChange: (v: string) => void; labelledBy: string }
  | { options: string[]; multi: true; value: string[]; onChange: (v: string[]) => void; labelledBy: string };

export function ChoiceGroup(props: Props) {
  const { options, labelledBy } = props;
  const isOn = (o: string) => (props.multi ? props.value.includes(o) : props.value === o);

  const toggle = (o: string) => {
    if (props.multi) {
      props.onChange(props.value.includes(o) ? props.value.filter(x => x !== o) : [...props.value, o]);
    } else {
      props.onChange(props.value === o ? '' : o);
    }
  };

  return (
    <div className="choices" role="group" aria-labelledby={labelledBy}>
      {options.map(o => (
        <button key={o} type="button" className={`choice${isOn(o) ? ' is-on' : ''}`}
          aria-pressed={isOn(o)} onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  );
}
