import { useEffect, useMemo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { usePipelineStore as useStore } from '../store/pipelineStore';
import styles from './BaseNode.module.css';

const cx = (...classNames) => classNames.filter(Boolean).join(' ');

const positionMap = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const getDefaultValue = (field, context) => {
  if (typeof field.defaultValue === 'function') {
    return field.defaultValue(context);
  }

  return field.defaultValue ?? '';
};

const resizeTextarea = (element) => {
  if (!element) {
    return;
  }

  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
};

const getHandlePosition = (handle, index, sideHandles) => {
  const explicitTop = handle.top ?? handle.style?.top;

  if (explicitTop) {
    return explicitTop;
  }

  if (sideHandles.length <= 1) {
    return '50%';
  }

  return `${((index + 1) / (sideHandles.length + 1)) * 100}%`;
};

export const BaseNode = ({
  id,
  data = {},
  title,
  subtitle,
  fields = [],
  handles = [],
  children,
  width = 260,
  minHeight,
  className = '',
  onFieldChange,
}) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const initialValues = useMemo(() => {
    return fields.reduce((values, field) => {
      values[field.name] = data?.[field.name] ?? getDefaultValue(field, { id, data });
      return values;
    }, {});
  }, [data, fields, id]);

  const [fieldValues, setFieldValues] = useState(initialValues);

  useEffect(() => {
    fields.forEach((field) => {
      if (data?.[field.name] === undefined) {
        updateNodeField(id, field.name, fieldValues[field.name]);
      }
    });
  }, [data, fields, fieldValues, id, updateNodeField]);

  const handleChange = (field, event) => {
    const value = event.target.value;

    if (field.type === 'textarea') {
      resizeTextarea(event.target);
    }

    setFieldValues((currentValues) => {
      const nextValues = { ...currentValues, [field.name]: value };
      updateNodeField(id, field.name, value);
      onFieldChange?.(field.name, value, nextValues);
      return nextValues;
    });
  };

  const renderField = (field) => {
    const fieldId = `${id}-${field.name}`;
    const value = fieldValues[field.name] ?? '';

    if (field.type === 'select') {
      return (
        <label className={styles.field} key={field.name} htmlFor={fieldId}>
          <span>{field.label}</span>
          <select id={fieldId} value={value} onChange={(event) => handleChange(field, event)}>
            {(field.options || []).map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;

              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        </label>
      );
    }

    if (field.type === 'textarea') {
      return (
        <label className={styles.field} key={field.name} htmlFor={fieldId}>
          <span>{field.label}</span>
          <textarea
            id={fieldId}
            value={value}
            rows={field.rows || 3}
            placeholder={field.placeholder}
            onChange={(event) => handleChange(field, event)}
            ref={(element) => resizeTextarea(element)}
          />
        </label>
      );
    }

    return (
      <label className={styles.field} key={field.name} htmlFor={fieldId}>
        <span>{field.label}</span>
        <input
          id={fieldId}
          type={field.type || 'text'}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => handleChange(field, event)}
        />
      </label>
    );
  };

  const handlesByPosition = handles.reduce((groups, handle) => {
    const positionName = handle.position || (handle.type === 'target' ? 'left' : 'right');

    return {
      ...groups,
      [positionName]: [...(groups[positionName] || []), handle],
    };
  }, {});

  return (
    <div className={cx(styles.node, className)} style={{ width, minHeight }}>
      {handles.map((handle) => {
        const positionName = handle.position || (handle.type === 'target' ? 'left' : 'right');
        const handleId = handle.absoluteId ? handle.id : `${id}-${handle.id}`;
        const sideHandles = handlesByPosition[positionName] || [];
        const sideIndex = sideHandles.indexOf(handle);
        const top = getHandlePosition(handle, sideIndex, sideHandles);
        const handleStyle = { ...handle.style, top };
        const labelStyle = top ? { top } : undefined;

        return (
          <div className={styles.port} key={`${handle.type}-${handleId}`}>
            <Handle
              type={handle.type}
              position={positionMap[positionName]}
              id={handleId}
              className={cx(
                styles.handle,
                positionName === 'left' && styles.handleLeft,
                positionName === 'right' && styles.handleRight
              )}
              style={handleStyle}
            />
            {handle.label ? (
              <span
                className={cx(
                  styles.handleLabel,
                  positionName === 'left' && styles.handleLabelLeft,
                  positionName === 'right' && styles.handleLabelRight
                )}
                style={labelStyle}
              >
                {handle.label}
              </span>
            ) : null}
          </div>
        );
      })}

      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      </div>

      {fields.length > 0 ? <div className={styles.fields}>{fields.map(renderField)}</div> : null}
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
};
